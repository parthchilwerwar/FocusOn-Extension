let focusOn = false;
let sessionEndTime = 0;
let allowedTabs = new Set();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'startFocusOn') {
        startFocusMode(request.duration);
        sendResponse({success: true});
    } else if (request.command === 'stopFocusOn') {
        stopFocusMode();
        sendResponse({success: true});
    } else if (request.command === 'checkFocusStatus') {
        sendResponse({ focusOn, timeRemaining: Math.max(0, sessionEndTime - Date.now()) });
    }
    return true;
});

function startFocusMode(duration) {
    focusOn = true;
    sessionEndTime = Date.now() + duration;
    chrome.alarms.create('stopFocusMode', { when: sessionEndTime });
    chrome.storage.local.set({ focusOn: true, sessionEndTime });

    chrome.tabs.query({}, (tabs) => {
        allowedTabs = new Set(tabs.map(tab => tab.id));
        enforceBlockingRules();
    });
}

function stopFocusMode() {
    focusOn = false;
    allowedTabs.clear();
    chrome.storage.local.set({ focusOn: false });
    chrome.alarms.clear('stopFocusMode');
    removeBlockingRules();
}

function enforceBlockingRules() {
    chrome.tabs.onCreated.addListener(onTabCreated);
    chrome.tabs.onUpdated.addListener(onTabUpdated);
    chrome.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate);
}

function removeBlockingRules() {
    chrome.tabs.onCreated.removeListener(onTabCreated);
    chrome.tabs.onUpdated.removeListener(onTabUpdated);
    chrome.webNavigation.onBeforeNavigate.removeListener(onBeforeNavigate);
}

function onTabCreated(tab) {
    if (focusOn && !allowedTabs.has(tab.id)) {
        chrome.tabs.remove(tab.id);
    }
}

function onTabUpdated(tabId, changeInfo, tab) {
    if (focusOn && !allowedTabs.has(tabId) && changeInfo.status === 'complete') {
        chrome.tabs.remove(tabId);
    }
}

function onBeforeNavigate(details) {
    if (focusOn && !allowedTabs.has(details.tabId)) {
        chrome.tabs.remove(details.tabId);
    }
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'stopFocusMode') {
        stopFocusMode();
    }
});

// Initialize state from storage
chrome.storage.local.get(['focusOn', 'sessionEndTime'], (result) => {
    if (result.focusOn) {
        focusOn = true;
        sessionEndTime = result.sessionEndTime;
        const remainingTime = sessionEndTime - Date.now();
        if (remainingTime > 0) {
            chrome.alarms.create('stopFocusMode', { when: sessionEndTime });
            enforceBlockingRules();
        } else {
            stopFocusMode();
        }
    }
});
