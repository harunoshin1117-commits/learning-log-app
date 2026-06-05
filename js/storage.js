(function () {
  const STORAGE_KEY = "studyLog.entries";

  function getLogs() {
    const rawLogs = localStorage.getItem(STORAGE_KEY);

    if (!rawLogs) {
      return [];
    }

    try {
      const logs = JSON.parse(rawLogs);
      return Array.isArray(logs) ? logs.map(normalizeLog) : [];
    } catch (error) {
      console.warn("勉強ログの読み込みに失敗しました。", error);
      return [];
    }
  }

  function normalizeLog(log) {
    const categories = Array.isArray(log.categories)
      ? log.categories
      : [log.category].filter(Boolean);

    return {
      ...log,
      categories,
      category: categories[0] || "その他",
      studyMinutes: Number(log.studyMinutes) || 0,
      otherCategory: log.otherCategory || "",
      updatedAt: log.updatedAt || log.createdAt
    };
  }

  function saveLogs(logs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }

  function addLog(log) {
    const logs = getLogs();
    const nextLog = {
      id: crypto.randomUUID(),
      content: log.content,
      categories: log.categories,
      category: log.categories[0],
      studyMinutes: Number(log.studyMinutes) || 0,
      otherCategory: log.otherCategory || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveLogs([nextLog, ...logs]);
    return nextLog;
  }

  function updateLog(id, updates) {
    const logs = getLogs().map((log) => {
      if (log.id !== id) {
        return log;
      }

      const categories = Array.isArray(updates.categories) ? updates.categories : log.categories;

      return {
        ...log,
        content: updates.content,
        categories,
        category: categories[0] || "その他",
        studyMinutes: Number(updates.studyMinutes) || 0,
        otherCategory: updates.otherCategory || "",
        updatedAt: new Date().toISOString()
      };
    });

    saveLogs(logs);
  }

  function deleteLog(id) {
    const logs = getLogs().filter((log) => log.id !== id);
    saveLogs(logs);
  }

  window.studyLogStorage = {
    getLogs,
    addLog,
    updateLog,
    deleteLog
  };
})();
