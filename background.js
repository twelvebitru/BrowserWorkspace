// background.js

// Открытие боковой панели при клике на иконку расширения
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Система автосохранения текущего состояния (для восстановления после сбоев)
let saveTimeout = null;

function saveCurrentState() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const activeTabsData = tabs
        .filter(tab => !tab.url.startsWith('chrome://'))
        .map(tab => ({
          title: tab.title || tab.url,
          url: tab.url,
          favicon: tab.favIconUrl || ''
        }));

      if (activeTabsData.length > 0) {
        await chrome.storage.local.set({
          lastActiveSession: {
            timestamp: new Date().toISOString(),
            tabs: activeTabsData
          }
        });
      }
    } catch (e) {
      console.error("Ошибка автосохранения:", e);
    }
  }, 2000);
}

// Слушатели изменения вкладок
chrome.tabs.onCreated.addListener(saveCurrentState);
chrome.tabs.onUpdated.addListener(saveCurrentState);
chrome.tabs.onRemoved.addListener(saveCurrentState);