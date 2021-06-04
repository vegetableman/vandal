const historyEnabledKey = "__VANDAL__HIST__STORAGE__ISENABLED";
let timeout;

function clearHistory() {
  browser.storage.local.clear().then(() => {
    document.getElementById("history-info").style.visibility = "visible";
    document.getElementById("history-info").innerHTML = "Cleared!";
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      document.getElementById("history-info").style.visibility = "hidden";
    }, 2000);
  }, () => {
    document.getElementById("history-info").innerHTML = "Some Error Occured!.";
  });
}

function toggleHistory() {
  const isEnabled = document.getElementById("is-hist-enabled").checked;
  browser.storage.sync.set({ [historyEnabledKey]: isEnabled });
}

async function restoreOptions() {
  const items = await browser.storage.local.get();
  if (items && Object.keys(items).length) {
    let count = 0;
    Object.keys(items).forEach((item) => {
      count += items[item].length;
    });
    if (count) {
      document.getElementById("history-info").style.visibility = "visible";
      document.getElementById("history-info").innerHTML = `ⓘ <span style="font-style:italic;">Found ${count} URL${count > 1 ? "'s" : ""}</span>`;
    }
  } else {
    document.getElementById("clear-logs").disabled = true;
  }
  browser.storage.sync.get(historyEnabledKey).then((item) => {
    if (typeof item[historyEnabledKey] === "undefined") {
      document.getElementById("is-hist-enabled").checked = false;
      return;
    }
    document.getElementById("is-hist-enabled").checked = item[historyEnabledKey];
  });
  document.getElementById("clear-logs").addEventListener("click", clearHistory);
  document.getElementById("is-hist-enabled").addEventListener("change", toggleHistory);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
