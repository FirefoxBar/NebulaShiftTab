import isDarkMode from '@/share/is-dark-mode';
import { prefs } from '@/share/prefs';
import { themeInfo } from '@/share/theme';

export function initThemeHandler() {
  const bgEl = document.createElement('div');
  bgEl.className = 'main-bg';
  document.body.appendChild(bgEl);

  function updateDark(dark: number) {
    if (dark === 0) {
      bgEl.style.backgroundColor = 'transparent';
      return;
    }
    if (dark < 0) {
      const abs = Math.abs(dark);
      if (abs < 10) {
        bgEl.style.backgroundColor = `rgba(255,255,255,0.0${abs})`;
        return;
      }
      bgEl.style.backgroundColor = `rgba(255,255,255,0.${abs})`;
      return;
    }
    if (dark < 10) {
      bgEl.style.backgroundColor = `rgba(0,0,0,0.0${dark})`;
      return;
    }
    bgEl.style.backgroundColor = `rgba(0,0,0,0.${dark})`;
  }

  prefs.getAndWatch('background', ({ dark, dark2, blur }) => {
    updateDark(isDarkMode() ? dark2 : dark);
    bgEl.style.backdropFilter = blur ? `blur(${blur / 5}px)` : '';
  });

  prefs.getAndWatch('theme', theme =>
    document.body.setAttribute('data-theme', theme),
  );

  prefs.getAndWatch('darkMode', () => {
    const nowDark = document.body.hasAttribute('theme-mode');
    const is = isDarkMode();
    if (is && !nowDark) {
      document.body.setAttribute('theme-mode', 'dark');
      updateDark(prefs.get('background').dark2);
    }
    if (!is && nowDark) {
      document.body.removeAttribute('theme-mode');
      updateDark(prefs.get('background').dark);
    }
  });
}
