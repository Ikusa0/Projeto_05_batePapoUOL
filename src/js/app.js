function login(event) {
  if (event.type !== "click" && event.key !== "Enter") return;

  const loginDiv = document.querySelector(".login");
  loginDiv.classList.add("hidden");
}

function getSideBar() {
  const sidebar = document.querySelector(".sidebar");
  const sidebarBackground = document.querySelector(".sidebar-background");

  return {
    bar: sidebar,
    background: sidebarBackground,
  };
}

function showSidebar() {
  const sidebar = getSideBar();

  sidebar.bar.classList.remove("hidden");
  sidebar.background.classList.remove("hidden");
}

function hideSidebar() {
  const sidebar = getSideBar();

  sidebar.bar.classList.add("hidden");
  sidebar.background.classList.add("hidden");
}

function getSelectedContact() {
  return document.querySelector(".contact.selected");
}

function selectContact(element) {
  const selected = getSelectedContact();

  selected.classList.remove("selected");
  element.classList.add("selected");
}

function getPrivateMessageInformation() {
  return document.querySelector("footer span");
}

// TODO: Criar uma função separada para mostrar mensagem de envio reservado

function selectMethod(element) {
  const selected = document.querySelector(".method.selected");
  const method = element.querySelector("h4");
  const privateMessageInformation = getPrivateMessageInformation();
  const selectedContact = getSelectedContact().querySelector("h4").innerHTML;

  selected.classList.remove("selected");
  element.classList.add("selected");

  if (method.innerHTML === "Reservadamente") {
    privateMessageInformation.querySelector(".name").innerHTML = selectedContact;
    privateMessageInformation.classList.remove("hidden");
  }

  if (method.innerHTML === "Público") {
    privateMessageInformation.classList.add("hidden");
  }
}
