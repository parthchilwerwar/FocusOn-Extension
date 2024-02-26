var focusOn = false;
var focusedTabs = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === 'startFocusOn') {
    focusOn = true;
    var duration = request.duration;

    setTimeout(function () {
      focusOn = false;
      chrome.storage.local.set({ 'focusOn': focusOn });
      clearFocusedTabs();
      showAlert('Focus Time Ended!');
    }, duration);

    chrome.storage.local.set({ 'focusOn': focusOn });

    blockNavigation();
  }
});

chrome.webNavigation.onCreated.addListener(function (details) {
  if (focusOn && details.tabId !== undefined && details.tabId !== chrome.tabs.TAB_ID_NONE) {
    markTabAsFocused(details.tabId);
  }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (focusOn && isTabFocused(tabId)) {
    if (removeInfo.isWindowClosing || removeInfo.url === undefined) {
      // Do nothing for closing windows or undefined URLs
    } else {
      removeFocusedTab(tabId);
    }
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (focusOn && changeInfo.status === 'complete') {
    markTabAsFocused(tabId);
  }
});

function blockNavigation() {
  chrome.webNavigation.onBeforeNavigate.addListener(function onBeforeNavigate(details) {
    if (focusOn) {
      if (!isTabFocused(details.tabId)) {
        if (details.tabId !== undefined && details.tabId !== chrome.tabs.TAB_ID_NONE) {
          const isRefresh = details.transitionType === 'reload';
          if (!isRefresh) {
            chrome.tabs.remove(details.tabId);
          }
        }
      }
    }
  });
}

function markTabAsFocused(tabId) {
  focusedTabs.push(tabId);
}

function isTabFocused(tabId) {
  return focusedTabs.includes(tabId);
}

function removeFocusedTab(tabId) {
  const index = focusedTabs.indexOf(tabId);
  if (index !== -1) {
    focusedTabs.splice(index, 1);
  }
}

function clearFocusedTabs() {
  focusedTabs = [];
}

function showAlert(message) {
  alert(message);
}
