// ========================= GLOBAL VARIABLES ==========================
const API_CONTACT_LIST = "https://mock-api.driven.com.br/api/v6/uol/participants";
const API_CONNECTION_STATUS = "https://mock-api.driven.com.br/api/v6/uol/status";
const API_MESSAGES = "https://mock-api.driven.com.br/api/v6/uol/messages";
let lastMessage;
let name;
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
  let minutes = time[1];
  let seconds = time[2];

  hours -= 3;

  if (hours < 0) {
    hours += 24;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

function compareMessages(m1, m2) {
  if (!m1 || !m2) {
    return false;
  }
  return m1.time === m2.time && m1.type === m2.type && m1.text === m2.text && m1.from === m2.from && m1.to === m2.to;
}

function getMessageInput() {
  return document.querySelector("footer input");
}

function getSendingMessageType() {
  const method = getSelectedMethod().querySelector("h4").innerHTML;
  if (method === "Reservadamente") {
    return "private_message";
  }
  return "message";
}

function getSendingMessageContact() {
  return getSelectedContact().querySelector("h4").innerHTML;
}

function getContactList() {
  return document.querySelector(".contact-list");
}

function clearContactList() {
  getContactList().innerHTML = "";
}
// =====================================================================

// ===================== EVENT LISTENER FUNCTIONS ======================
function login(event) {
  if (event.type !== "click" && event.key !== "Enter") return;

  console.log(event);
  name = document.querySelector(".login input").value;

  const promise = axios.post(API_CONTACT_LIST, {
    name: name,
  });

  promise.then(() => {
    const loginDiv = document.querySelector(".login");
    loginDiv.classList.add("hidden");
    loadMessages();
    loadContacts();

    window.setInterval(sendPresenceStatus, 4000);
    window.setInterval(loadMessages, 3000);
    window.setInterval(loadContacts, 10000);
  });

  promise.catch(() => {
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

  newSelected.classList.add("selected");

  if (!selected) return;

  selected.classList.remove("selected");

  changePrivateMessageInformation(selectedMethodText, newSelectedText);
}

function selectMethod(newSelected) {
  const selected = getSelectedMethod();
  const newSelectedText = newSelected.querySelector("h4").innerHTML;
  const selectedContact = getSelectedContact();

  if (!selectedContact) return;

  const selectedContactText = selectedContact.querySelector("h4").innerHTML;

  if (selectedContactText === "Todos" && newSelectedText === "Reservadamente") return;

  selected.classList.remove("selected");
  newSelected.classList.add("selected");

  changePrivateMessageInformation(newSelectedText, selectedContactText);
}

function sendMessage(event) {
  if (event.type !== "click" && event.key !== "Enter") return;
  const messageInput = getMessageInput();

  const type = getSendingMessageType();
  const text = messageInput.value;
  const from = name;
  const to = getSendingMessageContact();

  const promise = axios.post(API_MESSAGES, {
    from: from,
    to: to,
    text: text,
    type: type,
  });

  promise.then(() => {
    loadMessages();
    messageInput.value = "";
  });

  promise.catch((err) => {
    window.location.reload();
  });
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

function sendPresenceStatus() {
  const promise = axios.post(API_CONNECTION_STATUS, {
    name: name,
  });
}

function loadMessages() {
  const promise = axios.get(API_MESSAGES);

  promise.then((response) => {
    const chat = getChat();
    clearChat();

    response.data.forEach((message) => {
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
        if (to !== name && from !== name) return;
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

// FIXME: Quando atualiza a lista, o selected é perdido, tá todo bugado
function loadContacts() {
  const promise = axios.get(API_CONTACT_LIST);

  promise.then((response) => {
    const contactList = getContactList();

    let selectedContact = getSelectedContact();
    if (selectedContact) {
      selectedContact = selectedContact.querySelector("h4").innerHTML;
    }

    clearContactList();

    let selected = "";

    response.data.forEach((contact) => {
      const name = contact.name;

      if (name === selectedContact) {
        selected = "selected";
      }

      const contactBlock = `
      <div onclick="selectContact(this)" class="menu-option contact ${selected}">
        <div>
          <ion-icon class="icon" name="person-circle"></ion-icon>
          <h4>${name}</h4>
        </div>
        <ion-icon class="icon check" name="checkmark-circle"></ion-icon>
      </div>`;

      contactList.innerHTML += contactBlock;
    });
  });
}
// =====================================================================
