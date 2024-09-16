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
  