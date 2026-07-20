import { SessionCard } from './SessionCard.js';
import { ImportExport } from './ImportExport.js';

class Sidebar {
  constructor() {
    this.sessions = [];
    this.activeContextMenuSession = null;
    this.targetSession = null;
    this.currentLang = 'ru'; // По умолчанию русский
    this.init();
  }

  async init() {
    this.importExport = new ImportExport(() => this.loadSessions());
    this.bindEvents();
    await this.checkRecovery();
    
    // Сначала загружаем язык, потом сессии, чтобы они отрисовались на правильном языке
    chrome.storage.local.get(['appLang'], async (result) => {
      this.currentLang = result.appLang || 'ru';
      const langSelect = document.getElementById('lang-select');
      if (langSelect) {
        langSelect.value = this.currentLang;
        this.applyLanguage(this.currentLang);
      }
      await this.loadSessions();
    });
  }

  // Словарь для всех элементов интерфейса
  getI18n() {
    return {
      ru: {
        settingsTitle: "Настройки",
        guideTitle: "Инструкция приложения",
        devLabel: "Издатель и разработчик:",
        donateBtn: "Поддержать донатом",
        closeBtn: "Закрыть",
        createBtnText: "+ Создать сессию",
        searchPlaceholder: "Поиск сессий...",
        optNewest: "Сначала новые",
        optOldest: "Сначала старые",
        optName: "По алфавиту",
        exportBtn: "Экспорт",
        importBtn: "Импорт",
        mySessions: "Мои сессии",
        noSessions: "Сессии не найдены",
        ctxOpenCurrent: "Открыть в текущем окне",
        ctxRename: "Переименовать",
        ctxPin: "Закрепить / Открепить",
        ctxDuplicate: "Дублировать",
        ctxExport: "Экспортировать",
        ctxDelete: "Удалить",
        modalCreateTitle: "Новая сессия",
        modalRenameTitle: "Переименовать",
        modalConfirmTitle: "Удалить сессию?",
        btnCancel: "Отмена",
        btnSave: "Сохранить",
        btnDelete: "Удалить",
        btnYes: "Да",
        recoveryTitle: "Восстановить последние вкладки?"
      },
      en: {
        settingsTitle: "Settings",
        guideTitle: "App Instructions",
        devLabel: "Publisher and Developer:",
        donateBtn: "Support with a donation",
        closeBtn: "Close",
        createBtnText: "+ Create session",
        searchPlaceholder: "Search sessions...",
        optNewest: "Newest first",
        optOldest: "Oldest first",
        optName: "Alphabetical",
        exportBtn: "Export",
        importBtn: "Import",
        mySessions: "My sessions",
        noSessions: "No sessions found",
        ctxOpenCurrent: "Open in current window",
        ctxRename: "Rename",
        ctxPin: "Pin / Unpin",
        ctxDuplicate: "Duplicate",
        ctxExport: "Export",
        ctxDelete: "Delete",
        modalCreateTitle: "New session",
        modalRenameTitle: "Rename",
        modalConfirmTitle: "Delete session?",
        btnCancel: "Cancel",
        btnSave: "Save",
        btnDelete: "Delete",
        btnYes: "Yes",
        recoveryTitle: "Restore recent tabs?"
      }
    };
  }

  applyLanguage(lang) {
    this.currentLang = lang;
    const texts = this.getI18n()[lang] || this.getI18n().ru;
    
    // Тексты в настройках
    if (document.getElementById('txt-settings-title')) document.getElementById('txt-settings-title').textContent = texts.settingsTitle;
    if (document.getElementById('txt-guide-title')) document.getElementById('txt-guide-title').textContent = texts.guideTitle;
    if (document.getElementById('txt-dev-label')) document.getElementById('txt-dev-label').textContent = texts.devLabel;
    if (document.getElementById('txt-donate-btn')) document.getElementById('txt-donate-btn').textContent = texts.donateBtn;
    if (document.getElementById('txt-close-btn')) document.getElementById('txt-close-btn').textContent = texts.closeBtn;

    // Переключение инструкции
    const guideRu = document.getElementById('guide-ru');
    const guideEn = document.getElementById('guide-en');
    if (guideRu && guideEn) {
      if (lang === 'en') {
        guideRu.classList.add('hidden');
        guideEn.classList.remove('hidden');
      } else {
        guideRu.classList.remove('hidden');
        guideEn.classList.add('hidden');
      }
    }

    // Главный экран и тулбар
    const btnCreate = document.getElementById('btn-open-modal');
    if (btnCreate) btnCreate.textContent = texts.createBtnText;
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = texts.searchPlaceholder;

    if (document.getElementById('opt-newest')) document.getElementById('opt-newest').textContent = texts.optNewest;
    if (document.getElementById('opt-oldest')) document.getElementById('opt-oldest').textContent = texts.optOldest;
    if (document.getElementById('opt-name')) document.getElementById('opt-name').textContent = texts.optName;
    
    if (document.getElementById('btn-export-all')) document.getElementById('btn-export-all').textContent = texts.exportBtn;
    if (document.getElementById('lbl-import')) document.getElementById('lbl-import').textContent = texts.importBtn;
    if (document.getElementById('txt-my-sessions')) document.getElementById('txt-my-sessions').textContent = texts.mySessions;

    // Контекстное меню
    if (document.getElementById('ctx-open-current')) document.getElementById('ctx-open-current').textContent = texts.ctxOpenCurrent;
    if (document.getElementById('ctx-rename')) document.getElementById('ctx-rename').textContent = texts.ctxRename;
    if (document.getElementById('ctx-pin')) document.getElementById('ctx-pin').textContent = texts.ctxPin;
    if (document.getElementById('ctx-duplicate')) document.getElementById('ctx-duplicate').textContent = texts.ctxDuplicate;
    if (document.getElementById('ctx-export')) document.getElementById('ctx-export').textContent = texts.ctxExport;
    if (document.getElementById('ctx-delete')) document.getElementById('ctx-delete').textContent = texts.ctxDelete;

    // Модальные окна
    if (document.getElementById('txt-modal-create-title')) document.getElementById('txt-modal-create-title').textContent = texts.modalCreateTitle;
    if (document.getElementById('txt-modal-rename-title')) document.getElementById('txt-modal-rename-title').textContent = texts.modalRenameTitle;
    if (document.getElementById('txt-modal-confirm-title')) document.getElementById('txt-modal-confirm-title').textContent = texts.modalConfirmTitle;
    
    if (document.getElementById('btn-cancel-create')) document.getElementById('btn-cancel-create').textContent = texts.btnCancel;
    if (document.getElementById('btn-save-session')) document.getElementById('btn-save-session').textContent = texts.btnSave;
    if (document.getElementById('btn-cancel-rename')) document.getElementById('btn-cancel-rename').textContent = texts.btnCancel;
    if (document.getElementById('btn-save-rename')) document.getElementById('btn-save-rename').textContent = texts.btnSave;
    if (document.getElementById('btn-cancel-confirm')) document.getElementById('btn-cancel-confirm').textContent = texts.btnCancel;
    if (document.getElementById('btn-yes-confirm')) document.getElementById('btn-yes-confirm').textContent = texts.btnDelete;
    if (document.getElementById('txt-recovery-title')) document.getElementById('txt-recovery-title').textContent = texts.recoveryTitle;
    if (document.getElementById('btn-recover')) document.getElementById('btn-recover').textContent = texts.btnYes;

    // Перерисовываем список, чтобы обновился язык внутри карточек (даты, кнопка "Открыть")
    this.render();
  }

  bindEvents() {
    // Поиск и сортировка
    document.getElementById('search-input').addEventListener('input', () => this.render());
    document.getElementById('sort-select').addEventListener('change', () => this.render());

    // --- ЭКСПОРТ ВСЕХ СЕССИЙ ---
    const btnExportAll = document.getElementById('btn-export-all');
    if (btnExportAll) {
      btnExportAll.addEventListener('click', () => {
        this.importExport.exportAll(this.sessions);
      });
    }

    // --- МОДАЛЬНОЕ ОКНО СОЗДАНИЯ СЕССИИ ---
    const modalCreate = document.getElementById('modal-create');
    document.getElementById('btn-open-modal').addEventListener('click', async () => {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const validTabs = tabs.filter(t => !t.url.startsWith('chrome://'));
      const textPrefix = this.currentLang === 'en' ? 'Tabs to save: ' : 'Вкладок к сохранению: ';
      document.getElementById('modal-tabs-count').textContent = `${textPrefix}${validTabs.length}`;
      modalCreate.classList.remove('hidden');
      document.getElementById('session-name-input').focus();
    });

    document.getElementById('btn-cancel-create').addEventListener('click', () => {
      modalCreate.classList.add('hidden');
      document.getElementById('session-name-input').value = '';
    });

    document.getElementById('btn-save-session').addEventListener('click', () => this.saveCurrentSession());
    document.getElementById('session-name-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.saveCurrentSession();
    });

    // --- КОМПАКТНОЕ ОКНО ПЕРЕИМЕНОВАНИЯ ---
    const modalRename = document.getElementById('modal-rename');
    document.getElementById('btn-cancel-rename').addEventListener('click', () => {
      modalRename.classList.add('hidden');
      this.targetSession = null;
    });

    const saveRename = async () => {
      if (this.targetSession) {
        const newName = document.getElementById('rename-input').value.trim();
        if (newName) {
          this.targetSession.name = newName;
          await this.updateStorage();
        }
      }
      modalRename.classList.add('hidden');
      this.targetSession = null;
    };

    document.getElementById('btn-save-rename').addEventListener('click', saveRename);
    document.getElementById('rename-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveRename();
    });

    // --- КОМПАКТНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ---
    const modalConfirm = document.getElementById('modal-confirm');
    document.getElementById('btn-cancel-confirm').addEventListener('click', () => {
      modalConfirm.classList.add('hidden');
      this.targetSession = null;
    });

    document.getElementById('btn-yes-confirm').addEventListener('click', async () => {
      if (this.targetSession) {
        this.sessions = this.sessions.filter(s => s.id !== this.targetSession.id);
        await this.updateStorage();
      }
      modalConfirm.classList.add('hidden');
      this.targetSession = null;
    });

    // Закрытие контекстного меню при клике вне его
    document.addEventListener('click', () => {
      document.getElementById('context-menu').classList.add('hidden');
    });

    // Обработчик кликов в контекстном меню
    document.getElementById('context-menu').addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action && this.activeContextMenuSession) {
        this.handleAction(action, this.activeContextMenuSession);
      }
    });

    // Автовосстановление
    document.getElementById('btn-dismiss-recovery').addEventListener('click', () => {
      document.getElementById('recovery-banner').classList.add('hidden');
      chrome.storage.local.remove('lastActiveSession');
    });

    document.getElementById('btn-recover').addEventListener('click', async () => {
      const { lastActiveSession } = await chrome.storage.local.get(['lastActiveSession']);
      if (lastActiveSession && lastActiveSession.tabs) {
        this.openSessionTabs(lastActiveSession.tabs);
      }
      document.getElementById('recovery-banner').classList.add('hidden');
      chrome.storage.local.remove('lastActiveSession');
    });

    // --- НАСТРОЙКИ И ЛОКАЛИЗАЦИЯ ---
    const modalSettings = document.getElementById('modal-settings');
    const langSelect = document.getElementById('lang-select');

    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        this.applyLanguage(selectedLang);
        chrome.storage.local.set({ appLang: selectedLang });
      });
    }

    const btnOpenSettings = document.getElementById('btn-open-settings');
    if (btnOpenSettings && modalSettings) {
      btnOpenSettings.addEventListener('click', () => {
        modalSettings.classList.remove('hidden');
      });
    }

    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings && modalSettings) {
      btnCloseSettings.addEventListener('click', () => {
        modalSettings.classList.add('hidden');
      });
    }

    if (modalSettings) {
      modalSettings.addEventListener('click', (e) => {
        if (e.target === modalSettings) modalSettings.classList.add('hidden');
      });
    }
  }

  async checkRecovery() {
    const { lastActiveSession } = await chrome.storage.local.get(['lastActiveSession']);
    if (lastActiveSession && lastActiveSession.tabs && lastActiveSession.tabs.length > 0) {
      const banner = document.getElementById('recovery-banner');
      const timeStr = new Date(lastActiveSession.timestamp).toLocaleTimeString();
      const text = this.currentLang === 'en' 
        ? `${lastActiveSession.tabs.length} tabs from ${timeStr}`
        : `${lastActiveSession.tabs.length} вкладок от ${timeStr}`;
      document.getElementById('recovery-count').textContent = text;
      banner.classList.remove('hidden');
    }
  }

  async loadSessions() {
    const { sessions = [] } = await chrome.storage.local.get(['sessions']);
    this.sessions = sessions;
    document.getElementById('total-sessions-count').textContent = this.sessions.length;
    this.render();
  }

  async saveCurrentSession() {
    const nameInput = document.getElementById('session-name-input');
    const defaultName = this.currentLang === 'en' ? 'Untitled' : 'Без названия';
    const name = nameInput.value.trim() || defaultName;

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const tabsData = tabs
      .filter(t => !t.url.startsWith('chrome://'))
      .map(t => ({
        title: t.title || t.url,
        url: t.url,
        favicon: t.favIconUrl || ''
      }));

    if (tabsData.length === 0) {
      const alertMsg = this.currentLang === 'en' ? "No valid web pages open to save." : "Нет открытых веб-страниц для сохранения.";
      alert(alertMsg);
      return;
    }

    const newSession = {
      id: 'session_' + Date.now(),
      name: name,
      created: new Date().toISOString(),
      pinned: false,
      tabs: tabsData
    };

    this.sessions.unshift(newSession);
    await chrome.storage.local.set({ sessions: this.sessions });

    document.getElementById('modal-create').classList.add('hidden');
    nameInput.value = '';
    
    await this.loadSessions();
  }

  openSessionTabs(tabs) {
    const urls = tabs.map(t => t.url);
    chrome.windows.create({ url: urls, focused: true });
  }

  async openSessionTabsInCurrentWindow(tabs) {
    for (let i = 0; i < tabs.length; i++) {
      await chrome.tabs.create({
        url: tabs[i].url,
        active: i === 0
      });
    }
  }

  async handleAction(action, session) {
    switch (action) {
      case 'open':
        this.openSessionTabs(session.tabs);
        break;

      case 'open-current':
        this.openSessionTabsInCurrentWindow(session.tabs);
        break;

      case 'rename':
        this.targetSession = session;
        const renameModal = document.getElementById('modal-rename');
        const renameInput = document.getElementById('rename-input');
        renameInput.value = session.name;
        renameModal.classList.remove('hidden');
        renameInput.focus();
        break;

      case 'pin':
        session.pinned = !session.pinned;
        await this.updateStorage();
        break;

      case 'duplicate':
        const duplicated = JSON.parse(JSON.stringify(session));
        duplicated.id = 'session_' + Date.now();
        const copySuffix = this.currentLang === 'en' ? '(copy)' : '(копия)';
        duplicated.name = `${session.name} ${copySuffix}`;
        duplicated.created = new Date().toISOString();
        this.sessions.unshift(duplicated);
        await this.updateStorage();
        break;

      case 'export':
        this.importExport.exportSingle(session);
        break;

      case 'delete':
        this.targetSession = session;
        const confirmModal = document.getElementById('modal-confirm');
        const delMsg = this.currentLang === 'en' 
          ? `"${session.name}" will be deleted.`
          : `«${session.name}» будет удалена.`;
        document.getElementById('confirm-text').textContent = delMsg;
        confirmModal.classList.remove('hidden');
        break;
    }
  }

  async updateStorage() {
    await chrome.storage.local.set({ sessions: this.sessions });
    await this.loadSessions();
  }

  showContextMenu(event, session) {
    this.activeContextMenuSession = session;
    const menu = document.getElementById('context-menu');
    
    let x = event.clientX;
    let y = event.clientY;
    
    menu.classList.remove('hidden');
    
    if (x + menu.offsetWidth > window.innerWidth) x -= menu.offsetWidth;
    if (y + menu.offsetHeight > window.innerHeight) y -= menu.offsetHeight;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }

  render() {
    const listEl = document.getElementById('sessions-list');
    listEl.innerHTML = '';

    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-select').value;

    let filtered = this.sessions.filter(s => 
      s.name.toLowerCase().includes(searchQuery)
    );

    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === 'newest') return new Date(b.created) - new Date(a.created);
      if (sortBy === 'oldest') return new Date(a.created) - new Date(b.created);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    if (filtered.length === 0) {
      const noFoundText = this.getI18n()[this.currentLang]?.noSessions || "Сессии не найдены";
      listEl.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">${noFoundText}</div>`;
      return;
    }

    filtered.forEach(session => {
      const card = new SessionCard(
        session,
        (action, s) => this.handleAction(action, s),
        (e, s) => this.showContextMenu(e, s),
        this.currentLang // <--- Передаём язык в карточку!
      );
      listEl.appendChild(card.render());
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Sidebar();
});