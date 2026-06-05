(function () {
  const elements = {
    form: document.getElementById("logForm"),
    categoryInputs: Array.from(document.querySelectorAll('input[name="categories"]')),
    otherCategoryField: document.getElementById("otherCategoryField"),
    otherCategoryInput: document.getElementById("otherCategoryInput"),
    studyMinutesInput: document.getElementById("studyMinutesInput"),
    contentInput: document.getElementById("contentInput"),
    formMessage: document.getElementById("formMessage"),
    categoryFilter: document.getElementById("categoryFilter"),
    keywordInput: document.getElementById("keywordInput"),
    searchButton: document.getElementById("searchButton"),
    csvExportButton: document.getElementById("csvExportButton"),
    todayCount: document.getElementById("todayCount"),
    resultCount: document.getElementById("resultCount"),
    logList: document.getElementById("logList"),
    calendarGrid: document.getElementById("calendarGrid"),
    currentMonthLabel: document.getElementById("currentMonthLabel"),
    monthTotalMinutes: document.getElementById("monthTotalMinutes"),
    monthLogCount: document.getElementById("monthLogCount"),
    topStudyDay: document.getElementById("topStudyDay"),
    prevMonthButton: document.getElementById("prevMonthButton"),
    nextMonthButton: document.getElementById("nextMonthButton")
  };
  let calendarViewDate = new Date();
  let editingLogId = null;

  function getFilteredLogs() {
    const logs = window.studyLogStorage.getLogs();
    const selectedCategory = elements.categoryFilter.value;
    const keyword = elements.keywordInput.value.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesCategory = selectedCategory === "all" || log.categories.includes(selectedCategory);
      const matchesKeyword = keyword === ""
        || log.content.toLowerCase().includes(keyword)
        || log.categories.some((category) => category.toLowerCase().includes(keyword))
        || log.otherCategory.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }

  function getSelectedCategories() {
    return elements.categoryInputs
      .filter((input) => input.checked)
      .map((input) => input.value);
  }

  function escapeCsvValue(value) {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  }

  function updateOtherCategoryField() {
    if (!elements.otherCategoryField || !elements.otherCategoryInput) {
      return;
    }

    const hasOtherCategory = elements.categoryInputs.some((input) => input.value === "その他" && input.checked);
    elements.otherCategoryField.hidden = !hasOtherCategory;
    elements.otherCategoryInput.disabled = !hasOtherCategory;

    if (!hasOtherCategory) {
      elements.otherCategoryInput.value = "";
    }
  }

  function showMessage(text) {
    if (!elements.formMessage) {
      return;
    }

    elements.formMessage.textContent = text;
    window.setTimeout(() => {
      if (elements.formMessage.textContent === text) {
        elements.formMessage.textContent = "";
      }
    }, 2200);
  }

  function exportCsv() {
    const logs = window.studyLogStorage.getLogs();

    if (logs.length === 0) {
      window.alert("エクスポートするログがありません。");
      return;
    }

    const header = ["作成日時", "カテゴリ", "その他の内容", "学習時間（分）", "学習内容"];
    const rows = logs.map((log) => [
      log.createdAt,
      log.categories.join(" / "),
      log.otherCategory,
      log.studyMinutes,
      log.content
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "study-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateTodayCount() {
    const allLogs = window.studyLogStorage.getLogs();
    window.studyLogRender.renderTodayCount(allLogs, elements.todayCount);
  }

  function updateLogList() {
    if (!elements.logList) {
      return;
    }

    window.studyLogRender.renderLogs(getFilteredLogs(), elements, editingLogId);
  }

  function updateCalendar() {
    if (!elements.calendarGrid) {
      return;
    }

    window.studyLogRender.renderCalendar(window.studyLogStorage.getLogs(), calendarViewDate, elements);
  }

  function bindFormPage() {
    if (!elements.form) {
      return;
    }

    elements.form.addEventListener("submit", (event) => {
      event.preventDefault();

      const content = elements.contentInput.value.trim();
      const categories = getSelectedCategories();
      const otherCategory = elements.otherCategoryInput.value.trim();
      const studyMinutes = Number(elements.studyMinutesInput.value) || 0;

      if (content === "") {
        showMessage("学習内容を入力してください。");
        return;
      }

      if (categories.length === 0) {
        showMessage("カテゴリを1つ以上選んでください。");
        return;
      }

      if (studyMinutes < 0) {
        showMessage("学習時間は0以上で入力してください。");
        return;
      }

      window.studyLogStorage.addLog({ content, categories, studyMinutes, otherCategory });
      elements.form.reset();
      updateOtherCategoryField();
      showMessage("保存しました。");
      updateTodayCount();
    });

    elements.categoryInputs.forEach((input) => {
      input.addEventListener("change", updateOtherCategoryField);
    });
    updateOtherCategoryField();
  }

  function bindLogsPage() {
    if (!elements.logList) {
      return;
    }

    elements.categoryFilter.addEventListener("change", updateLogList);
    elements.searchButton.addEventListener("click", updateLogList);
    elements.keywordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        updateLogList();
      }
    });
    elements.csvExportButton.addEventListener("click", exportCsv);
    elements.logList.addEventListener("change", (event) => {
      if (event.target.name !== "categories") {
        return;
      }

      const form = event.target.closest(".edit-form");

      if (!form) {
        return;
      }

      updateEditOtherCategoryField(form);
    });
    elements.logList.addEventListener("submit", (event) => {
      const form = event.target.closest(".edit-form");

      if (!form) {
        return;
      }

      event.preventDefault();
      saveEditedLog(form);
    });
    elements.logList.addEventListener("click", (event) => {
      const editButton = event.target.closest(".edit-button");
      const cancelEditButton = event.target.closest(".cancel-edit-button");
      const deleteButton = event.target.closest(".delete-button");

      if (editButton) {
        editingLogId = editButton.dataset.id;
        updateLogList();
        return;
      }

      if (cancelEditButton) {
        editingLogId = null;
        updateLogList();
        return;
      }

      if (!deleteButton) {
        return;
      }

      window.studyLogStorage.deleteLog(deleteButton.dataset.id);
      editingLogId = null;
      updateTodayCount();
      updateLogList();
    });
  }

  function updateEditOtherCategoryField(form) {
    const otherField = form.querySelector(".edit-other-category-field");
    const otherInput = form.querySelector('input[name="otherCategory"]');
    const hasOtherCategory = Array.from(form.querySelectorAll('input[name="categories"]'))
      .some((input) => input.value === "その他" && input.checked);

    otherField.hidden = !hasOtherCategory;
    otherInput.disabled = !hasOtherCategory;

    if (!hasOtherCategory) {
      otherInput.value = "";
    }
  }

  function saveEditedLog(form) {
    const content = form.elements.content.value.trim();
    const categories = Array.from(form.querySelectorAll('input[name="categories"]'))
      .filter((input) => input.checked)
      .map((input) => input.value);
    const studyMinutes = Number(form.elements.studyMinutes.value) || 0;
    const otherCategory = form.elements.otherCategory.value.trim();

    if (content === "") {
      window.alert("学習内容を入力してください。");
      return;
    }

    if (categories.length === 0) {
      window.alert("カテゴリを1つ以上選んでください。");
      return;
    }

    if (studyMinutes < 0) {
      window.alert("学習時間は0以上で入力してください。");
      return;
    }

    window.studyLogStorage.updateLog(form.dataset.id, {
      content,
      categories,
      studyMinutes,
      otherCategory
    });
    editingLogId = null;
    updateTodayCount();
    updateLogList();
  }

  function bindCalendarPage() {
    if (!elements.calendarGrid) {
      return;
    }

    elements.prevMonthButton.addEventListener("click", () => {
      calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1);
      updateCalendar();
    });

    elements.nextMonthButton.addEventListener("click", () => {
      calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1);
      updateCalendar();
    });
  }

  bindFormPage();
  bindLogsPage();
  bindCalendarPage();
  updateTodayCount();
  updateLogList();
  updateCalendar();
})();
