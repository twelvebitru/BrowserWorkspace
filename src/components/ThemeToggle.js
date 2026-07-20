export class ThemeToggle {
  constructor() {
    this.buttons = document.querySelectorAll('.btn-toggle');
    this.statusText = document.getElementById('theme-status-text');
    this.init();
  }

  async init() {
    const { themeMode = 'off' } = await chrome.storage.local.get(['themeMode']);
    this.updateUI(themeMode);

    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.setTheme(mode);
      });
    });
  }

  async setTheme(mode) {
    await chrome.storage.local.set({ themeMode: mode });
    this.updateUI(mode);
  }

  updateUI(mode) {
    this.buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    const labels = { off: 'Выкл', dark: 'Dark', amoled: 'AMOLED' };
    this.statusText.textContent = labels[mode] || 'Выкл';

    // Применяем выбранную тему к самой боковой панели
    document.documentElement.classList.remove('theme-dark', 'theme-amoled', 'theme-light');
    if (mode === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else if (mode === 'amoled') {
      document.documentElement.classList.add('theme-amoled');
    } else {
      document.documentElement.classList.add('theme-light');
    }
  }
}