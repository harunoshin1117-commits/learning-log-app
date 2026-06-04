(function () {
  function formatDate(isoString) {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(isoString));
  }

  function isToday(isoString) {
    const target = new Date(isoString);
    const today = new Date();

    return target.getFullYear() === today.getFullYear()
      && target.getMonth() === today.getMonth()
      && target.getDate() === today.getDate();
  }

  function createLogCard(log) {
    const card = document.createElement("article");
    card.className = "log-card";

    const header = document.createElement("div");
    header.className = "log-card-header";

    const meta = document.createElement("div");
    meta.className = "log-meta";

    const category = document.createElement("span");
    category.className = "category-badge";
    category.textContent = log.category;

    const date = document.createElement("span");
    date.className = "log-date";
    date.textContent = formatDate(log.createdAt);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.dataset.id = log.id;
    deleteButton.textContent = "削除";

    const content = document.createElement("p");
    content.className = "log-content";
    content.textContent = log.content;

    meta.append(category, date);
    header.append(meta, deleteButton);
    card.append(header, content);

    return card;
  }

  function renderLogs(logs, elements) {
    elements.logList.innerHTML = "";
    elements.resultCount.textContent = `${logs.length}件`;

    if (logs.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "条件に合うログはありません。";
      elements.logList.append(empty);
      return;
    }

    logs.forEach((log) => {
      elements.logList.append(createLogCard(log));
    });
  }

  function renderTodayCount(logs, todayCountElement) {
    const count = logs.filter((log) => isToday(log.createdAt)).length;
    todayCountElement.textContent = count;
  }

  window.studyLogRender = {
    renderLogs,
    renderTodayCount
  };
})();
