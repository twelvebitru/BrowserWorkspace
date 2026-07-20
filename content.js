// content.js

let styleElement = null;

const THEME_STYLES = {
  dark: `
    html {
      filter: invert(100%) hue-rotate(180deg) brightness(96%) contrast(95%) !important;
      background-color: #0d0d0d !important;
    }
    body {
      background-color: #0d0d0d !important;
    }
    /* Исключаем медиа-элементы из инверсии, чтобы фото и видео выглядели естественно */
    img, video, iframe, canvas, svg, [style*="background-image"] {
      filter: invert(100%) hue-rotate(180deg) !important;
    }
  `,
  amoled: `
    html {
      filter: invert(100%) hue-rotate(180deg) contrast(102%) !important;
      background-color: #000000 !important;
    }
    body, main, header, footer, section, article, div {
      background-color: #000000 !important;
    }
    img, video, iframe, canvas, svg, [style*="background-image"] {
      filter: invert(100%) hue-rotate(180deg) !important;
    }
  `
};

function applyTheme(mode) {
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'bw-theme-styles';
    document.documentElement.appendChild(styleElement);
  }

  if (mode === 'off' || !THEME_STYLES[mode]) {
    styleElement.textContent = '';
    return;
  }

  styleElement.textContent = THEME_STYLES[mode];
}

// Загрузка сохраненного режима при старте страницы
chrome.storage.local.get(['themeMode'], (result) => {
  if (result.themeMode && result.themeMode !== 'off') {
    applyTheme(result.themeMode);
  }
});

// Слушатель изменений в реальном времени из боковой панели
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.themeMode) {
    applyTheme(changes.themeMode.newValue);
  }
});