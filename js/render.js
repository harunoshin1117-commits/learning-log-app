(function () {
  const CATEGORY_OPTIONS = ["JavaScript", "Codex", "Git", "AI活用", "その他"];

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

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getStudyLevel(minutes) {
    if (minutes <= 0) {
      return 0;
    }

    if (minutes < 60) {
      return 1;
    }

    if (minutes < 120) {
      return 2;
    }

    if (minutes < 180) {
      return 3;
    }

    return 4;
  }

  function createEditForm(log) {
    const form = document.createElement("form");
    form.className = "edit-form";
    form.dataset.id = log.id;

    const categoryField = document.createElement("fieldset");
    categoryField.className = "edit-category-field";

    const legend = document.createElement("legend");
    legend.textContent = "カテゴリ";
    categoryField.append(legend);

    CATEGORY_OPTIONS.forEach((categoryName) => {
      const label = document.createElement("label");
      const input = document.createElement("input");

      input.type = "checkbox";
      input.name = "categories";
      input.value = categoryName;
      input.checked = log.categories.includes(categoryName);
      label.append(input, ` ${categoryName}`);
      categoryField.append(label);
    });

    const otherField = document.createElement("div");
    otherField.className = "edit-other-category-field";
    otherField.hidden = !log.categories.includes("その他");

    const otherLabel = document.createElement("label");
    otherLabel.textContent = "その他の内容";

    const otherInput = document.createElement("input");
    otherInput.type = "text";
    otherInput.name = "otherCategory";
    otherInput.value = log.otherCategory;
    otherInput.placeholder = "例: 英語、資格勉強、読書";
    otherInput.disabled = !log.categories.includes("その他");
    otherField.append(otherLabel, otherInput);

    const minutesLabel = document.createElement("label");
    minutesLabel.textContent = "学習時間（分）";

    const minutesInput = document.createElement("input");
    minutesInput.type = "number";
    minutesInput.name = "studyMinutes";
    minutesInput.min = "0";
    minutesInput.step = "5";
    minutesInput.value = log.studyMinutes;

    const contentLabel = document.createElement("label");
    contentLabel.textContent = "学習内容";

    const contentInput = document.createElement("textarea");
    contentInput.name = "content";
    contentInput.rows = 4;
    contentInput.value = log.content;

    const actions = document.createElement("div");
    actions.className = "edit-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.textContent = "保存";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "secondary-button cancel-edit-button";
    cancelButton.textContent = "キャンセル";

    actions.append(saveButton, cancelButton);
    form.append(categoryField, otherField, minutesLabel, minutesInput, contentLabel, contentInput, actions);

    return form;
  }

  function createLogCard(log, isEditing) {
    const card = document.createElement("article");
    card.className = "log-card";

    if (isEditing) {
      card.classList.add("is-editing");
    }

    const header = document.createElement("div");
    header.className = "log-card-header";

    const meta = document.createElement("div");
    meta.className = "log-meta";

    log.categories.forEach((categoryName) => {
      const category = document.createElement("span");
      category.className = "category-badge";
      category.textContent = categoryName === "その他" && log.otherCategory
        ? `その他: ${log.otherCategory}`
        : categoryName;
      meta.append(category);
    });

    const date = document.createElement("span");
    date.className = "log-date";
    date.textContent = `作成 ${formatDate(log.createdAt)}`;

    const updatedDate = document.createElement("span");
    updatedDate.className = "log-date updated-date";
    updatedDate.textContent = `更新 ${formatDate(log.updatedAt)}`;

    const studyTime = document.createElement("span");
    studyTime.className = "study-time";
    studyTime.textContent = `${log.studyMinutes}分`;

    const cardActions = document.createElement("div");
    cardActions.className = "card-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary-button edit-button";
    editButton.dataset.id = log.id;
    editButton.textContent = "編集";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.dataset.id = log.id;
    deleteButton.textContent = "削除";

    const content = document.createElement("p");
    content.className = "log-content";
    content.textContent = log.content;

    cardActions.append(editButton, deleteButton);
    meta.append(studyTime, date, updatedDate);
    header.append(meta, cardActions);
    card.append(header);

    if (isEditing) {
      card.append(createEditForm(log));
    } else {
      card.append(content);
    }

    return card;
  }

  function renderLogs(logs, elements, editingLogId) {
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
      elements.logList.append(createLogCard(log, log.id === editingLogId));
    });
  }

  function renderTodayCount(logs, todayCountElement) {
    if (!todayCountElement) {
      return;
    }

    const count = logs.filter((log) => isToday(log.createdAt)).length;
    todayCountElement.textContent = count;
  }

  function renderCalendar(logs, viewDate, elements) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalsByDate = new Map();
    let monthTotalMinutes = 0;
    let monthLogCount = 0;
    let topDay = null;

    logs.forEach((log) => {
      const createdDate = new Date(log.createdAt);

      if (createdDate.getFullYear() !== year || createdDate.getMonth() !== month) {
        return;
      }

      const key = formatDateKey(createdDate);
      const minutes = Number(log.studyMinutes) || 0;
      const current = totalsByDate.get(key) || 0;

      totalsByDate.set(key, current + minutes);
      monthTotalMinutes += minutes;
      monthLogCount += 1;
    });

    totalsByDate.forEach((minutes, key) => {
      if (!topDay || minutes > topDay.minutes) {
        topDay = { key, minutes };
      }
    });

    elements.calendarGrid.innerHTML = "";
    elements.currentMonthLabel.textContent = `${year}年${month + 1}月`;
    elements.monthTotalMinutes.textContent = monthTotalMinutes;
    elements.monthLogCount.textContent = monthLogCount;
    elements.topStudyDay.textContent = topDay ? `${Number(topDay.key.slice(8, 10))}日 ${topDay.minutes}分` : "-";

    for (let index = 0; index < firstDay.getDay(); index += 1) {
      const blank = document.createElement("div");
      blank.className = "calendar-day blank";
      elements.calendarGrid.append(blank);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(year, month, day);
      const key = formatDateKey(date);
      const minutes = totalsByDate.get(key) || 0;
      const cell = document.createElement("article");
      const dayNumber = document.createElement("span");
      const minuteLabel = document.createElement("small");

      cell.className = `calendar-day level-${getStudyLevel(minutes)}`;
      dayNumber.textContent = day;
      minuteLabel.textContent = minutes > 0 ? `${minutes}分` : "";
      cell.setAttribute("aria-label", `${day}日 ${minutes}分`);
      cell.append(dayNumber, minuteLabel);
      elements.calendarGrid.append(cell);
    }
  }

  window.studyLogRender = {
    renderLogs,
    renderTodayCount,
    renderCalendar
  };
})();
