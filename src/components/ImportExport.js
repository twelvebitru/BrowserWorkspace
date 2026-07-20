export class ImportExport {
  constructor(onUpdate) {
    this.onUpdate = onUpdate;
    this.init();
  }

  init() {
    document.getElementById('btn-export-all').addEventListener('click', () => this.exportAll());
    document.getElementById('import-file').addEventListener('change', (e) => this.importFile(e));
  }

  async exportAll() {
    const { sessions = [] } = await chrome.storage.local.get(['sessions']);
    if (sessions.length === 0) {
      alert("Нет сохраненных сессий для экспорта.");
      return;
    }
    this.downloadFile(sessions, `all_sessions_${Date.now()}.browserworkspace`);
  }

  exportSingle(session) {
    this.downloadFile([session], `${session.name}_${Date.now()}.browserworkspace`);
  }

  downloadFile(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const sessionsToImport = Array.isArray(importedData) ? importedData : [importedData];

        // Валидация структуры
        const validSessions = sessionsToImport.filter(s => 
          s && typeof s.name === 'string' && Array.isArray(s.tabs)
        ).map(s => ({
          ...s,
          id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          created: s.created || new Date().toISOString(),
          pinned: !!s.pinned
        }));

        if (validSessions.length === 0) {
          throw new Error("Неверный формат файла");
        }

        const { sessions = [] } = await chrome.storage.local.get(['sessions']);
        const updatedSessions = [...validSessions, ...sessions];
        
        await chrome.storage.local.set({ sessions: updatedSessions });
        this.onUpdate();
        alert(`Успешно импортировано сессий: ${validSessions.length}`);
      } catch (err) {
        alert("Ошибка импорта: Неверная структура файла .browserworkspace");
        console.error(err);
      }
      event.target.value = ''; // Сброс инпута
    };
    reader.readAsText(file);
  }
}