const LOCAL_STORAGE_KEY = "RLCS_PLAYERS_DATA";
document.addEventListener("DOMContentLoaded", main);
document.addEventListener("select-row", (ev) => {
  if (window.selectedRow) {
    window.selectedRow.classList.remove("table-primary");
  }
  if (window.selectedRow !== ev.detail.elem) {
    window.selectedRow = ev.detail.elem;
    window.selectedRow.classList.add("table-primary");
    enableEditAndDeleteButtons();
    window.selectedRowIndex = ev.detail.index;
  } else {
    window.selectedRow = undefined;
    disableEditAndDeleteButtons();
    window.selectedRowIndex = undefined;
  }
});

class Player {
  constructor(player_tag, nationality, team, date_of_birth, status, retirement_date) {
    this.player_tag = player_tag;
    this.nationality = nationality;
    this.team = team;
    this.date_of_birth = date_of_birth;
    this.status = status;
    this.retirement_date = retirement_date;
  }
  static fromObject(playerObj) {
    return new Player(playerObj.player_tag, playerObj.nationality, playerObj.team, playerObj.date_of_birth, playerObj.status, playerObj.retirement_date)
  }
  static fromFormData(formData) {
    const player_tag = formData.get("player-tag");
    const nationality = formData.get("nationality");
    const team = formData.get("team");
    const date_of_birth = formData.get("date-of-birth");
    const status = formData.get("status");
    const retirement_date = formData.get("retirement-date");
    return new Player(player_tag, nationality, team, date_of_birth, status, retirement_date);
  }
  toNode(index) {
    const tableRow = document.createElement("tr");
    tableRow.dataset.rowIndex = index;
    tableRow.onclick = (ev) => {
      document.dispatchEvent(new CustomEvent("select-row", {detail: {
        index,
        elem: tableRow
      }}));
    }
    ["player_tag", "nationality", "team", "date_of_birth"].forEach(key => {
      const tableCell = document.createElement("td");
      tableCell.innerText = this[key];
      tableRow.appendChild(tableCell);
    });
    let tableCell = document.createElement("td");
    tableCell.innerText = `${this.status}${this.retirement_date ? ' (' + this.retirement_date + ')' : ''}`;
    tableRow.appendChild(tableCell);
    return tableRow;
  }
  toArr() {
    return Object.values(this);
  }
}

function enableEditAndDeleteButtons() {
  const editBtn = document.querySelector("#edit-btn");
  const deleteBtn = document.querySelector("#delete-btn");
  [editBtn, deleteBtn].forEach(btn => {
    btn.ariaDisabled = false;
    btn.removeAttribute("disabled");
    btn.classList.remove("disabled");
  });
}

function disableEditAndDeleteButtons() {
  const editBtn = document.querySelector("#edit-btn");
  const deleteBtn = document.querySelector("#delete-btn");
  [editBtn, deleteBtn].forEach(btn => {
    btn.ariaDisabled = true;
    btn.setAttribute("disabled", "");
    btn.classList.add("disabled");
  });
}

function getInitialData() {
  const localStorageData = getDataFromLocalStorage();
  if (!localStorageData) {
    showNotification("Initial Data Load", "Loaded initial data, no memory found", "bg-primary");
    window.playerData = window.initialData;
    storeDataInLocalStorage(window.playerData);
    return window.initialData;
  }
  window.playerData = localStorageData;
  return localStorageData;
}

function getDataFromLocalStorage() {
  const stringifiedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stringifiedData) return;
  const parsedData = JSON.parse(stringifiedData);
  return parsedData;
}

function storeDataInLocalStorage(data) {
  const stringifiedData = JSON.stringify(data);
  localStorage.setItem(LOCAL_STORAGE_KEY, stringifiedData);
}

function removeSelectedRow() {
  const selectedRowIndex = window.selectedRow.dataset.rowIndex;
  window.selectedRow = undefined;
  window.playerData.splice(selectedRowIndex, 1);
  storeDataInLocalStorage(window.playerData);
  window.dataTable.row(selectedRowIndex).remove().draw(false);
}

function addNewRow(player) {
  const playerInstance = Player.fromObject(player);
  const index = window.playerData.length;
  window.playerData.push(playerInstance);
  storeDataInLocalStorage(window.playerData);
  window.dataTable.row.add(playerInstance.toNode(index)).draw(false);
}

function updateSelectedPlayer(player) {
  const playerInstance = Player.fromObject(player);
  window.playerData[window.selectedRowIndex] = playerInstance;
  storeDataInLocalStorage(window.playerData);
  window.dataTable.row(selectedRowIndex).data(playerInstance.toArr());
  window.dataTable.draw();
}

function addNationalitiesSelection() {
  const selects = document.querySelectorAll('select.nationality');
  COUNTRIES.sort((a, b) => a.localeCompare(b));
  selects.forEach(select => {
    COUNTRIES.forEach(country => {
      const option = document.createElement("option");
      option.text = country;
      option.value = country;
      select.appendChild(option);
    });
  });
}

function addTeamsSelection() {
  const selects = document.querySelectorAll('select.team');
  TEAMS.sort((a, b) => a.localeCompare(b));
  selects.forEach(select => {
    TEAMS.forEach(team => {
      const option = document.createElement("option");
      option.text = team;
      option.value = team;
      select.appendChild(option);
    });
  });
}

function handleDateOfRetirementEnableDisable(parent) {
  const DoR = parent.querySelector(".dor");
  parent.querySelector(".status").onchange = (ev) => {
    if (ev.target.value === "Retired") {
      DoR.removeAttribute("disabled");
      DoR.classList.remove("disabled");
      DoR.ariaDisabled = "false";
      DoR.labels[0].classList.remove("text-secondary");
    } else {
      DoR.setAttribute("disabled", "");
      DoR.classList.add("disabled");
      DoR.ariaDisabled = "true";
      DoR.labels[0].classList.add("text-secondary");
    }
  }
}

function showNotification(title, content, badgeStyle) {
  if (!badgeStyle) badgeStyle = "bg-primary";
  const toast = document.createElement('div');
  toast.id = 'liveToast';
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  const toastHeader = document.createElement('div');
  toastHeader.className = 'toast-header';

  const badge = document.createElement('div');
  badge.textContent = " ";
  badge.style.height = "16px";
  badge.style.width = "16px";
  badge.className = `badge me-2 ${badgeStyle}`;

  const strong = document.createElement('strong');
  strong.className = 'me-auto';
  strong.innerText = title;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-close';
  button.setAttribute('data-bs-dismiss', 'toast');
  button.setAttribute('aria-label', 'Close');

  toastHeader.appendChild(badge);
  toastHeader.appendChild(strong);
  toastHeader.appendChild(button);

  const toastBody = document.createElement('div');
  toastBody.className = 'toast-body';
  toastBody.innerText = content;

  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);

  document.querySelector("#toast-container").appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, {autohide: false});
  bsToast.show();
  setTimeout(() => {
    bsToast.hide();
    setTimeout(() => {
      toast.remove();
    }, 1000);
  }, 10000);
}

function main() {
  addNationalitiesSelection();
  addTeamsSelection();
  const tableBody = document.querySelector("#table-body");
  const data = getInitialData();
  for (const index in data) {
    const player = data[index];
    const playerInstance = Player.fromObject(player);
    const tableRow = playerInstance.toNode(index);
    tableBody.appendChild(tableRow);
  };

  const addBtn = document.querySelector("#add-btn");
  const editBtn = document.querySelector("#edit-btn");
  const deleteBtn = document.querySelector("#delete-btn");
  const addDialog = document.querySelector("#add-row-dialog");
  const addDialogForm = addDialog.querySelector("form");
  const addDialogConfirmBtn = document.querySelector("#add-form-confirm-btn");
  const addDialogCloseBtn = document.querySelector("#add-form-close-btn");
  const editDialog = document.querySelector("#edit-row-dialog");
  const editDialogForm = editDialog.querySelector("form");
  const editDialogCloseBtn = document.querySelector("#edit-form-close-btn");
  const editDialogConfirmBtn = document.querySelector("#edit-form-confirm-btn");
  const deleteDialog = document.querySelector("#delete-row-dialog");
  const deleteDialogConfirmBtn = document.querySelector("#delete-row-dialog").querySelector(".btn-yes");
  const deleteDialogCancelBtn = document.querySelector("#delete-row-dialog").querySelector(".btn-no");

  handleDateOfRetirementEnableDisable(addDialogForm);
  handleDateOfRetirementEnableDisable(editDialogForm);

  addBtn.onclick = () => {
    addDialog.showModal();
  }
  addDialogConfirmBtn.onclick = (ev) => {
    if (!addDialogForm.checkValidity()) return;
    ev.preventDefault();
    const formData = new FormData(addDialogForm);
    const player = Player.fromFormData(formData);
    addNewRow(player);
    addDialogForm.reset();
    addDialog.close();
    showNotification("Success", "Added a new player", "bg-success");
  }
  addDialogCloseBtn.onclick = (ev) => {
    ev.preventDefault();
    addDialog.close();
  }
  editBtn.onclick = () => {
    editDialog.showModal();
    const selectedPlayer = window.playerData[window.selectedRowIndex];
    editDialog.querySelector(`.player-tag`).value = selectedPlayer.player_tag;
    editDialog.querySelector(`.nationality`).value = selectedPlayer.nationality;
    editDialog.querySelector(`.nationality`).dispatchEvent(new Event("change"));
    editDialog.querySelector(`.team`).value = selectedPlayer.team;
    editDialog.querySelector(`.team`).dispatchEvent(new Event("change"));
    editDialog.querySelector(`.status`).value = selectedPlayer.status;
    editDialog.querySelector(`.status`).dispatchEvent(new Event("change"));
    editDialog.querySelector(`.dob`).value = selectedPlayer.date_of_birth;
    editDialog.querySelector(`.dor`).value = selectedPlayer.retirement_date;
  }
  editDialogCloseBtn.onclick = (ev) => {
    ev.preventDefault();
    editDialog.close();
  }
  editDialogConfirmBtn.onclick = (ev) => {
    if (!editDialogForm.checkValidity()) return;
    ev.preventDefault();
    const formData = new FormData(editDialogForm);
    const player = Player.fromFormData(formData);
    updateSelectedPlayer(player);

    document.dispatchEvent(new CustomEvent("select-row", {detail: {
      index: window.selectedRowIndex,
      elem: window.selectedRow
    }}));

    editDialog.close();
    showNotification("Success", "Updated an existing player", "bg-success");
  }
  deleteBtn.onclick = () => {
    deleteDialog.showModal();
  }
  deleteDialogConfirmBtn.onclick = (ev) => {
    ev.preventDefault();
    removeSelectedRow();
    deleteDialog.close();
    showNotification("Success", "Removed an existing player", "bg-success");
  }
  deleteDialogCancelBtn.onclick = (ev) => {
    ev.preventDefault();
    deleteDialog.close();
  }

  window.dataTable = new DataTable("#players-table");
}