const url = decodeURIComponent(window.location.search.replace("?url=", ""));
const iframe = document.createElement("iframe");
if (url) {
  iframe.src = url;
}

iframe.id = "vandal-inner-frame";
iframe.style.width = "100%";
iframe.style.height = "100%";
iframe.style.border = "0px";
iframe.setAttribute("frameborder", "0");
if (url && !url.endsWith("pdf")) {
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-forms allow-popups allow-same-origin allow-presentation allow-modals"
  );
}

window.onload = () => {
  document.body.appendChild(iframe);
};
