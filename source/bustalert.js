import domLoaded from 'dom-loaded';

let tmpl;

class BustAlert {
  constructor() {
    this.root = document.createElement('vandal-alert');
    let shadowRoot = this.root.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(tmpl.content.cloneNode(true));

    this.container = document.createElement('div');
    this.container.classList.add('vandal-alert');
    this.container.classList.add('vandal-alert__fade-enter');

    let div = document.createElement('div');
    div.classList.add('vandal-alert__wrapper');
    div.innerHTML = `<span>The page could not be loaded in Vandal. To navigate further, please try the web archive link
    <a class="vandal-alert__link" href="${this.getArchiveURL()}">here</a></span>`;
    div.appendChild(this.getCloseIcon());
    this.container.appendChild(div);
    shadowRoot.appendChild(this.container);
    document.body.appendChild(this.root);

    setTimeout(() => {
      this.container.classList.add('vandal-alert__fade-done');
    }, 500);
  }

  handleClose = () => {
    this.container.classList.remove('vandal-alert__fade-done');
    this.root.parentNode.removeChild(this.root);
    this.root = null;
    this.container = null;
  };

  getArchiveURL() {
    const currentURL = new URL(location.href);
    if (currentURL.host === 'web.archive.org') {
      return location.href.replace('im_', '');
    } else {
      return `https://web.archive.org/web/*/${location.href.replace(
        /[\?|\&]?tag=vandal/,
        ''
      )}`;
    }
  }

  getCloseIcon() {
    const closeIcon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    closeIcon.classList.add('vandal-alert__close-icon');
    closeIcon.setAttribute('viewBox', '0 0 1024 1280');
    const title = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'title'
    );
    title.innerHTML = 'Close';
    closeIcon.appendChild(title);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M887.132 833.893L560.497 507.258l320.308-320.314c12.085-12.088 12.085-31.67 0-43.757-12.086-12.085-31.684-12.085-43.756 0L516.74 463.5 190.101 136.86c-12.026-12.026-31.535-12.026-43.561 0-12.04 12.026-12.04 31.549 0 43.575L473.173 507.07l-336.267 336.27c-12.08 12.087-12.08 31.669 0 43.755 12.086 12.087 31.677 12.087 43.763 0l336.262-336.267L843.573 877.47c12.026 12.026 31.52 12.026 43.56 0 12.026-12.027 12.026-31.55 0-43.577z'
    );
    path.setAttribute('fill', '#ffffff');
    closeIcon.appendChild(path);
    closeIcon.addEventListener('click', this.handleClose);
    return closeIcon;
  }
}

async function init() {
  await domLoaded;
  tmpl = document.createElement('template');
  tmpl.innerHTML = `
    <style>
      .vandal-alert {
        left: calc(50% - 240px);
        position: fixed;
        top: 70px;
        height: 37px;
        z-index: 10000000;
      }

      .vandal-alert__fade-enter {
        opacity: 0.01;
        transform: translate3d(0, -10px, 0);
        transition: all 0.15s ease-out;
      }

      .vandal-alert__fade-done {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }

      .vandal-alert__wrapper {
        display: flex;
        align-items: center;
        font-family: 'Source Sans Pro', Helvetica;
        background: #333;
        font-size: 12.2px;
        color: #f5f5f5;
        border-radius: 3px;
        height: 100%;
        min-width: 140px;
        padding: 0 10px 0 15px;
      }

      .vandal-alert__link {
        color: orange;
        margin: 0 0 0 1px;
      }

      .vandal-alert__close-icon {
        cursor: pointer;
        width: 13px;
        height: 13px;
        stroke: #fff;
        stroke-width: 40px;
        position: relative;
        top: -5px;
        right: -3px;
        margin-left: 3px;
      }
    </style>
  `;
  new BustAlert();
}

init();
