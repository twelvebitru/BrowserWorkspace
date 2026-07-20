export class SessionCard {
  constructor(session, onAction, onContextMenu, lang = 'ru') {
    this.session = session;
    this.onAction = onAction;
    this.onContextMenu = onContextMenu;
    this.lang = lang; // Сохраняем язык
  }

  formatDate(isoString) {
    const date = new Date(isoString);
    // Форматируем дату в зависимости от выбранного языка (ru-RU или en-US)
    const locale = this.lang === 'en' ? 'en-US' : 'ru-RU';
    return date.toLocaleDateString(locale, { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  getTabWord(count) {
    if (this.lang === 'en') {
      return count === 1 ? 'tab' : 'tabs';
    }
    // Логика для русского языка (вкл.)
    return 'вкл.';
  }

  render() {
    const card = document.createElement('div');
    card.className = `session-card ${this.session.pinned ? 'pinned' : ''}`;
    
    const tabsCount = this.session.tabs ? this.session.tabs.length : 0;
    const dateStr = this.formatDate(this.session.created);
    const tabWord = this.getTabWord(tabsCount);
    const openBtnText = this.lang === 'en' ? 'Open' : 'Открыть';

    card.innerHTML = `
      <div class="session-info">
        <div class="session-header">
          <h3 class="session-title">${this.session.name}</h3>
          ${this.session.pinned ? '<span class="pin-icon" title="Pinned"></span>' : ''}
        </div>
        <div class="session-meta">
          <span>${tabsCount} ${tabWord}</span>
          <span>•</span>
          <span>${dateStr}</span>
        </div>
      </div>
      <div class="session-actions">
        <button class="btn btn-primary btn-sm btn-open">${openBtnText}</button>
      </div>
    `;

    // Клик левой кнопкой по всей карточке (кроме кнопки "Открыть")
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-open')) {
        this.onAction('open', this.session);
      }
    });

    // Клик по кнопке "Открыть"
    const btnOpen = card.querySelector('.btn-open');
    btnOpen.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onAction('open', this.session);
    });

    // Клик правой кнопкой мыши (Контекстное меню)
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.onContextMenu(e, this.session);
    });

    return card;
  }
}