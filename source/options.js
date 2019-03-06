const key = '__VANDAL__HIST__LOGGING__ENABLED';

function onLoad() {
  document
    .getElementById('is-log-enabled')
    .addEventListener('click', handleToggleLog);
  document.getElementById('url-save-btn').addEventListener('click', handleSave);
  chrome.storage.sync.get(key, function(checked) {
    if (typeof checked[key] === 'undefined') {
      setLogEnabled(true);
      document.getElementById('is-log-enabled').checked = true;
      return;
    }
    document.getElementById('is-log-enabled').checked = checked[key];
  });
}

function handleSave() {
  // chrome.permissions.request(
  //   {
  //     origins: ['http://www.google.com/']
  //   },
  //   function(granted) {
  //     // The callback argument will be true if the user granted the permissions.
  //     if (granted) {
  //       console.log('granted');
  //       // doSomething();
  //     } else {
  //       console.log('disgranted');
  //       // doSomethingElse();
  //     }
  //   }
  // );
}

function setLogEnabled(isLogEnabled) {
  chrome.storage.sync.set({ [key]: isLogEnabled }, function() {});
}

function handleToggleLog(e) {
  setLogEnabled(e.target.checked);
}

document.addEventListener('DOMContentLoaded', onLoad);
