import { StorageKey } from '@/share/constant';
import isDarkMode from '@/share/is-dark-mode';
import { prefs } from '@/share/prefs';
import { getAndWatch, local } from '@/share/storage';

function withRAF(callback: () => void) {
  let waiting = false;
  return () => {
    if (waiting) {
      return;
    }
    waiting = true;
    requestAnimationFrame(() => {
      try {
        callback();
      } catch (e) {
        console.error(e);
      }
      waiting = false;
    });
  };
}

function handleStyleVar() {
  const styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  const updateStyle = withRAF(() => {
    const width = prefs.get('siteWidth');
    const gap = prefs.get('siteGap');
    const size = prefs.get('siteSize');
    styleEl.innerHTML = `body{--site-area-width:${width}px;--site-area-gap:${gap}px;--site-icon-size:${size}px}`;
  });

  prefs.watchKey('siteGap', updateStyle);
  prefs.watchKey('siteSize', updateStyle);
  prefs.watchKey('siteWidth', updateStyle);
  updateStyle();
}

function handleDarkMode() {
  const bgEl = document.createElement('div');
  bgEl.className = 'main-bg';
  document.body.appendChild(bgEl);

  let currentDark = 0;

  const updateDark = withRAF(() => {
    if (currentDark === 0) {
      bgEl.style.backgroundColor = 'transparent';
      return;
    }
    if (currentDark < 0) {
      const abs = Math.abs(currentDark);
      if (abs < 10) {
        bgEl.style.backgroundColor = `rgba(255,255,255,0.0${abs})`;
        return;
      }
      bgEl.style.backgroundColor = `rgba(255,255,255,0.${abs})`;
      return;
    }
    if (currentDark < 10) {
      bgEl.style.backgroundColor = `rgba(0,0,0,0.0${currentDark})`;
      return;
    }
    bgEl.style.backgroundColor = `rgba(0,0,0,0.${currentDark})`;
  });

  prefs.getAndWatch('background', ({ dark, dark2, blur }) => {
    currentDark = isDarkMode() ? dark2 : dark;
    bgEl.style.backdropFilter = blur ? `blur(${blur / 5}px)` : '';
    updateDark();
  });

  prefs.getAndWatch('darkMode', () => {
    const nowDark = document.body.hasAttribute('theme-mode');
    const is = isDarkMode();
    if (is && !nowDark) {
      document.body.setAttribute('theme-mode', 'dark');
      currentDark = prefs.get('background').dark2;
      updateDark();
    }
    if (!is && nowDark) {
      document.body.removeAttribute('theme-mode');
      currentDark = prefs.get('background').dark;
      updateDark();
    }
  });
}

function handleBackgroundImage() {
  const bgImgEl = document.createElement('div');
  bgImgEl.className = 'main-bg-img';
  document.body.appendChild(bgImgEl);
  getAndWatch(local, StorageKey.bg, x => {
    if (x) {
      bgImgEl.style.backgroundImage = `url(${x})`;
    }
  });
}

function handleCustomCSS() {
  const styleEl = document.createElement('style');
  styleEl.id = 'custom-css';
  document.head.appendChild(styleEl);
  prefs.getAndWatch('customCSS', css => {
    styleEl.innerHTML = css;
  });
}

function handleOther() {
  prefs.getAndWatch('theme', theme =>
    document.body.setAttribute('data-theme', theme),
  );
}

handleStyleVar();
handleDarkMode();
handleBackgroundImage();
handleCustomCSS();
handleOther();
