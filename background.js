chrome.runtime.onInstalled.addListener(() => {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Extension Installed',
    message: 'Thank you for installing the extension!',
    priority: 2
  }, (notificationId) => {
    if (chrome.runtime.lastError) {
      console.error('Error creating notification:', chrome.runtime.lastError);
    } else {
      console.log('Notification created with ID:', notificationId);
    }
  });
});

const updateBadge = (url) => {
  chrome.storage.sync.get(url, (data) => {
    const items = data[url] || [];
    if (items.length) {
      chrome.action.setBadgeText({ text: ' ! ' });
      chrome.action.setBadgeBackgroundColor({ color: 'rgb(51, 51, 51)' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkData") {
    const url = message.url;
    updateBadge(url);
    return true; 
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      updateBadge(url);
    });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    updateBadge(url);
  });
});