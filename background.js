var focusOn = false;
var focusedTabs = new Set();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'startFocusOn') {
        focusOn = true;
        const duration = request.duration;

        setTimeout(function () {
            stopFocusMode();
        }, duration);

        chrome.storage.local.set({ focusOn: true });
        blockNavigation();
    } else if (request.command === 'stopFocusOn') {
        stopFocusMode();
    }
});

chrome.webNavigation.onCreatedNavigationTarget.addListener(function (details) {
    if (focusOn && details.tabId !== undefined) {
        focusedTabs.add(details.tabId);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (focusOn && focusedTabs.has(tabId)) {
        if (!removeInfo.isWindowClosing) {
            focusedTabs.delete(tabId);
        }
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (focusOn && changeInfo.status === 'complete') {
        focusedTabs.add(tabId);
    }
});

function blockNavigation() {
    chrome.webNavigation.onBeforeNavigate.addListener(beforeNavigateHandler);
}

function beforeNavigateHandler(details) {
    if (focusOn && !focusedTabs.has(details.tabId)) {
        const isReload = details.transitionType === 'reload';
        if (!isReload) {
            chrome.tabs.remove(details.tabId);
        }
    }
}

function stopFocusMode() {
    focusOn = false;
    chrome.storage.local.set({ focusOn: false });
    focusedTabs.clear();
    chrome.webNavigation.onBeforeNavigate.removeListener(beforeNavigateHandler);

    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['toast.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Script injection failed: " + chrome.runtime.lastError.message);
                }
            });
        }
    });
}
