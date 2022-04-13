// TODO: Criar uma função separada para mostrar mensagem de envio reservado

// ========================= GLOBAL VARIABLES ==========================
const API_CONTACT_LIST = "https://mock-api.driven.com.br/api/v6/uol/participants";
const API_CONNECTION_STATUS = "https://mock-api.driven.com.br/api/v6/uol/status";
const API_MESSAGES = "https://mock-api.driven.com.br/api/v6/uol/messages";
// =====================================================================

// =========================== AUX FUNCTIONS ===========================
function getSidebar() {
  return document.querySelector(".sidebar");
}

function getSidebarBackground() {
  return document.querySelector(".sidebar-background");
}

function getSelectedContact() {
  return document.querySelector(".contact.selected");
}

function getSelectedMethod() {
  return document.querySelector(".method.selected");
}

function getPrivateMessageInformation() {
  return document.querySelector("footer span");
}
// =====================================================================

// ===================== EVENT LISTENER FUNCTIONS ======================
function login(event) {
  if (event.type !== "click" && event.key !== "Enter") return;

  const name = document.querySelector(".login input").value;

  const promise = axios.post(API_CONTACT_LIST, {
    name: name,
  });

  promise.then(function () {
    const loginDiv = document.querySelector(".login");
    loginDiv.classList.add("hidden");
    window.setInterval(sendPresenceStatus, 4000, name);
  });

  promise.catch(function () {
    const errorMessage = document.querySelector(".login span");
    errorMessage.classList.remove("hidden");
  });
}

function showSidebar() {
  const sidebar = getSidebar();
  const sidebarBackground = getSidebarBackground();
  sidebar.classList.remove("hidden");
  sidebarBackground.classList.remove("hidden");
}

function hideSidebar() {
  const sidebar = getSidebar();
  const sidebarBackground = getSidebarBackground();
  sidebar.classList.add("hidden");
  sidebarBackground.classList.add("hidden");
}

function selectContact(newSelected) {
  const selected = getSelectedContact();
  const newSelectedText = newSelected.querySelector("h4").innerHTML;
  const selectedMethodText = getSelectedMethod().querySelector("h4").innerHTML;

  if (newSelectedText === "Todos" && selectedMethodText === "Reservadamente") return;

  selected.classList.remove("selected");
  newSelected.classList.add("selected");

  changePrivateMessageInformation(selectedMethodText, newSelectedText);
}

function selectMethod(newSelected) {
  const selected = getSelectedMethod();
  const newSelectedText = newSelected.querySelector("h4").innerHTML;
  const selectedContactText = getSelectedContact().querySelector("h4").innerHTML;

  if (selectedContactText === "Todos" && newSelectedText === "Reservadamente") return;

  selected.classList.remove("selected");
  newSelected.classList.add("selected");

  changePrivateMessageInformation(newSelectedText, selectedContactText);
}
// =====================================================================

// ======================= MAIN FUNCTIONALITIES ========================
function changePrivateMessageInformation(method, contact) {
  const privateMessageInformation = getPrivateMessageInformation();

  if (method === "Reservadamente") {
    privateMessageInformation.firstElementChild.innerHTML = contact;
    privateMessageInformation.classList.remove("hidden");
  }

  if (method === "Público") {
    privateMessageInformation.classList.add("hidden");
  }
}

function sendPresenceStatus(name) {
  const promise = axios.post(API_CONNECTION_STATUS, {
    name: name,
  });

  promise.then(() => {
    console.log("Presence Status Sent");
  });
}
// =====================================================================
