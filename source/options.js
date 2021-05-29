const historyKey = "__VANDAL__HIST__STORAGE__ISENABLED";

function clearHistory() {
  browser.storage.local.clear();
}

function toggleHistory() {
  const isEnabled = document.getElementById("is-hist-enabled").checked;
  browser.storage.sync.set({ [historyKey]: isEnabled });
}

function restoreOptions() {
  browser.storage.sync.get(historyKey).then((item) => {
    if (typeof item[historyKey] === "undefined") {
      document.getElementById("is-hist-enabled").checked = false;
      return;
    }
    document.getElementById("is-hist-enabled").checked = item[historyKey];
  });
  document.getElementById("clear-logs").addEventListener("click", clearHistory);
  document.getElementById("is-hist-enabled").addEventListener("change", toggleHistory);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
