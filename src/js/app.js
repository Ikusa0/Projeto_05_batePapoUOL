// TODO: Criar uma função separada para mostrar mensagem de envio reservado

// ========================= GLOBAL VARIABLES ==========================
const API_CONTACT_LIST = "https://mock-api.driven.com.br/api/v6/uol/participants";
const API_CONNECTION_STATUS = "https://mock-api.driven.com.br/api/v6/uol/status";
const API_MESSAGES = "https://mock-api.driven.com.br/api/v6/uol/messages";
let lastMessage;
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

function getChat() {
  return document.querySelector(".webpage");
}

function clearChat() {
  getChat().innerHTML = "";
}

function convertTime(time) {
  time = time.split(":");
  let hours = parseInt(time[0]);
  let minutes = parseInt(time[1]);
  let seconds = parseInt(time[2]);

  hours -= 3;

  if (hours < 0) {
    hours += 24;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function compareMessages(m1, m2) {
  if (!m1 || !m2) {
    return false;
  }
  return m1.time === m2.time && m1.type === m2.type && m1.text === m2.text && m1.from === m2.from && m1.to === m2.to;
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
    loadMessages(name);

    window.setInterval(sendPresenceStatus, 4000, name);
    window.setInterval(loadMessages, 3000, name);
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

function loadMessages(name) {
  const promise = axios.get(API_MESSAGES);

  promise.then(function (response) {
    const chat = getChat();
    clearChat();

    response.data.forEach(function (message) {
      const time = convertTime(message.time);
      const type = message.type;
      const text = message.text;
      const from = message.from;
      const to = message.to;

      if (type === "message") {
        const messageBlock = `
        <div class="message">
          <span class="time">(${time})</span>
          <span class="name">${from}</span>
          <span class="method">para</span>
          <span class="destination">${to}:</span>
          <span class="content">${text}</span>
        </div>`;

        chat.innerHTML += messageBlock;
      }

      if (type === "status") {
        const messageBlock = `
        <div class="message status">
          <span class="time">(${time})</span>
          <span class="name">${from}</span>
          <span class="content">${text}</span>
        </div>`;

        chat.innerHTML += messageBlock;
      }

      if (type === "private_message") {
        if (to !== name) return;
        const messageBlock = `
        <div class="message private">
          <span class="time">(${time})</span>
          <span class="name">${from}</span>
          <span class="method">reservadamente para</span>
          <span class="destination">${to}:</span>
          <span class="content">${text}</span>
        </div>`;

        chat.innerHTML += messageBlock;
      }
    });

    if (!compareMessages(lastMessage, response.data.at(-1))) {
      lastMessage = response.data.at(-1);
      chat.lastElementChild.scrollIntoView();
    }
  });
}
// =====================================================================
