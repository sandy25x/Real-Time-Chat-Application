const socket = io();

// Elements
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const joinBtn = document.getElementById('join-btn');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const chatBox = document.getElementById('chat-box');
const nameInput = document.getElementById('username');
const chatHeader = document.getElementById('chat-header');
const typingIndicator = document.getElementById('typing-indicator');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = '';
let typingTimeout;

// Join chat
joinBtn.addEventListener('click', () => {
  const username = nameInput.value.trim();
  if (username !== '') {
    currentUser = username;
    socket.emit('join', username);
    joinScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    chatHeader.innerHTML = `<div class="avatar">👤</div><div class="chat-title">${username}</div>`;
  }
});

// Send message
sendBtn.addEventListener('click', sendMessage);

// Enter key also sends message
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Typing indicator
messageInput.addEventListener('input', () => {
  socket.emit('typing', currentUser);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stopTyping');
  }, 1000);
});

// Receive message
socket.on('message', (data) => {
  appendMessage(data, false);
  playSound();
});

// Typing
socket.on('typing', (username) => {
  typingIndicator.innerText = `${username} is typing...`;
  typingIndicator.classList.remove('hidden');
});

socket.on('stopTyping', () => {
  typingIndicator.classList.add('hidden');
  typingIndicator.innerText = '';
});

// Notifications
socket.on('user-joined', (username) => {
  showNotification(`${username} joined the chat 🐾`);
});

socket.on('user-left', (username) => {
  showNotification(`${username} left the jungle 🌴`);
});

// Helpers
function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg !== '') {
    const data = {
      user: currentUser,
      msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    appendMessage(data, true);
    socket.emit('message', data);
    messageInput.value = '';
    socket.emit('stopTyping');
  }
}

function appendMessage(data, isOwn) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message');
  if (isOwn) messageEl.classList.add('own');

  messageEl.innerHTML = `
    <div class="avatar">👤</div>
    <div class="content">
      <div class="meta"><strong>${data.user}</strong> • <span>${data.time}</span></div>
      <div class="text">${data.msg}</div>
    </div>
  `;
  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showNotification(text) {
  const notif = document.createElement('div');
  notif.classList.add('notification');
  notif.innerText = text;
  chatBox.appendChild(notif);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function playSound() {
  const beep = document.getElementById('notif-sound');
  if (beep) {
    beep.play().catch(e => {
      console.warn('Autoplay prevented:', e);
    });
  }
}

logoutBtn.addEventListener('click', () => {
  if (currentUser) {
    socket.emit('leave', currentUser); // Notify server
  }

  // Reset UI
  chatScreen.classList.add('hidden');
  joinScreen.classList.remove('hidden');
  nameInput.value = '';
  messageInput.value = '';
  chatBox.innerHTML = '';
  typingIndicator.classList.add('hidden');
  typingIndicator.innerText = '';
  currentUser = '';
});


// Dark mode
const themeSelect = document.getElementById('theme-select');
themeSelect.addEventListener('change', () => {
  const selectedTheme = themeSelect.value;
  document.body.classList.remove('theme-default', 'theme-dark', 'theme-jungle');
  document.body.classList.add(`theme-${selectedTheme}`);
});