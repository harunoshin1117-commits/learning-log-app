(function () {
  const STORAGE_KEY = "studyLog.entries";

  function getLogs() {
    const rawLogs = localStorage.getItem(STORAGE_KEY);

    if (!rawLogs) {
      return [];
    }

    try {
      const logs = JSON.parse(rawLogs);
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.warn("勉強ログの読み込みに失敗しました。", error);
      return [];
    }
  }

  function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  function addLog(log) {
    const logs = getLogs();
    const nextLog = {
      id: crypto.randomUUID(),
      content: log.content,
      category: log.category,
      createdAt: new Date().toISOString()
    };

    saveLogs([nextLog, ...logs]);
    return nextLog;
  }

  function deleteLog(id) {
    const logs = getLogs().filter((log) => log.id !== id);
    saveLogs(logs);
  }

  window.studyLogStorage = {
    getLogs,
    addLog,
    deleteLog
  };
})();
