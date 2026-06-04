(function () {
  const elements = {
    form: document.getElementById("logForm"),
    categoryInput: document.getElementById("categoryInput"),
    contentInput: document.getElementById("contentInput"),
    formMessage: document.getElementById("formMessage"),
    categoryFilter: document.getElementById("categoryFilter"),
    keywordInput: document.getElementById("keywordInput"),
    todayCount: document.getElementById("todayCount"),
    resultCount: document.getElementById("resultCount"),
    logList: document.getElementById("logList")
  };

  function getFilteredLogs() {
    const logs = window.studyLogStorage.getLogs();
    const selectedCategory = elements.categoryFilter.value;
    const keyword = elements.keywordInput.value.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
      const matchesKeyword = keyword === ""
        || log.content.toLowerCase().includes(keyword)
        || log.category.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }

  function updateView() {
    const allLogs = window.studyLogStorage.getLogs();
    const filteredLogs = getFilteredLogs();

    window.studyLogRender.renderTodayCount(allLogs, elements.todayCount);
    window.studyLogRender.renderLogs(filteredLogs, elements);
  }

  function showMessage(text) {
    elements.formMessage.textContent = text;
    window.setTimeout(() => {
      if (elements.formMessage.textContent === text) {
        elements.formMessage.textContent = "";
      }
    }, 2200);
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const content = elements.contentInput.value.trim();
    const category = elements.categoryInput.value;

    if (content === "") {
      showMessage("学習内容を入力してください。");
      return;
    }

    window.studyLogStorage.addLog({ content, category });
    elements.form.reset();
    elements.categoryInput.value = category;
    showMessage("保存しました。");
    updateView();
  });

  elements.categoryFilter.addEventListener("change", updateView);
  elements.keywordInput.addEventListener("input", updateView);

  elements.logList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-button");

    if (!deleteButton) {
      return;
    }

    window.studyLogStorage.deleteLog(deleteButton.dataset.id);
    updateView();
  });

  updateView();
})();
