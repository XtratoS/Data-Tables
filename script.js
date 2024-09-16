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
  } else {
    window.selectedRow = undefined;
    disableEditAndDeleteButtons();
  }
});

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
    window.playerData = window.initialData;
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
  window.dataTable.row(selectedRowIndex).remove().draw();
}

function addNationalitiesSelection() {
  const selects = document.querySelectorAll('select.nationality');
  const selectOptions = COUNTRIES.sort((a, b) => a.localeCompare(b)).map(country => {
    const option = document.createElement("option");
    option.text = country;
    option.value = country;
    return option;
  });
  selects.forEach(select => {
    selectOptions.forEach(option => {
      select.appendChild(option);
    });
  });
}

function addTeamsSelection() {
  const selects = document.querySelectorAll('select.team');
  const selectOptions = TEAMS.sort((a, b) => a.localeCompare(b)).map(country => {
    const option = document.createElement("option");
    option.text = country;
    option.value = country;
    return option;
  });
  selects.forEach(select => {
    selectOptions.forEach(option => {
      select.appendChild(option);
    });
  });
}

function main() {
  addNationalitiesSelection();
  addTeamsSelection();
  const DoR = document.querySelector("#add-form-date-of-retire");
  document.querySelector("#add-form-status").onchange = (ev) => {
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
  const tableBody = document.querySelector("#table-body");
  const dataKeys = ["player_tag", "nationality", "team_most_time", "date_of_birth", "status"];
  const data = getInitialData();
  for (const index in data) {
    const player = data[index];
    const tableRow = document.createElement("tr");
    tableRow.dataset.rowIndex = index;
    tableRow.onclick = (ev) => {
      document.dispatchEvent(new CustomEvent("select-row", {detail: {
        index,
        elem: tableRow
      }}));
    }
    if (player.retirement_date) {
      player.status += ` (${player.retirement_date})`;
    }
    dataKeys.forEach(key => {
      const tableCell = document.createElement("td");
      tableCell.innerText = player[key];
      tableRow.appendChild(tableCell);
    });
    tableBody.appendChild(tableRow);
  };

  const addBtn = document.querySelector("#add-btn");
  const editBtn = document.querySelector("#edit-btn");
  const deleteBtn = document.querySelector("#delete-btn");
  const addDialog = document.querySelector("#add-row-dialog");
  const addDialogForm = addDialog.querySelector("form");
  const addDialogConfirmBtn = document.querySelector("#add-form-confirm-btn");
  const editDialog = document.querySelector("#edit-row-dialog");
  const deleteDialog = document.querySelector("#delete-row-dialog");
  const deleteDialogConfirmBtn = document.querySelector("#delete-row-dialog").querySelector(".btn-yes");
  const deleteDialogCancelBtn = document.querySelector("#delete-row-dialog").querySelector(".btn-no");
  addBtn.onclick = () => {
    addDialog.showModal();
  }
  addDialogConfirmBtn.onclick = (ev) => {
    if (!addDialogForm.checkValidity()) return;
    ev.preventDefault();
    const formData = new FormData(addDialogForm);
    // TODO ADD NEW PLAYER
    addDialog.close(formData);
  }
  editBtn.onclick = () => {
    editDialog.showModal();
  }
  deleteBtn.onclick = () => {
    deleteDialog.showModal();
  }
  deleteDialogConfirmBtn.onclick = (ev) => {
    ev.preventDefault();
    removeSelectedRow();
    deleteDialog.close();
  }
  deleteDialogCancelBtn.onclick = (ev) => {
    ev.preventDefault();
    deleteDialog.close();
  }

  window.dataTable = new DataTable("#players-table");
}