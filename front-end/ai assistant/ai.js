const feed = document.getElementById('chat-feed');
const title = document.getElementById('chat-title');
const note = document.getElementById('chat-note');
const input = document.getElementById('message-input');
const composer = document.getElementById('composer-form');
const newChatBtn = document.getElementById('new-chat-btn');
const quickReplyBtn = document.getElementById('demo-reply-btn');
const backendUrl = window.location.protocol.startsWith('http') ? window.location.origin : 'http://localhost:8000';
const historyKey = 'globalAdNetworkAiChatHistory';
const memoryKey = 'globalAdNetworkAiMemory';
const sessionKey = 'globalAdNetworkAiSessionId';

const sessionId = localStorage.getItem(sessionKey) || generateSessionId();
localStorage.setItem(sessionKey, sessionId);

let chatHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
let memoryNotes = JSON.parse(localStorage.getItem(memoryKey) || '[]');

function generateSessionId() {
  return `session-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function saveChatHistory() {
  localStorage.setItem(historyKey, JSON.stringify(chatHistory));
}

function saveMemoryNotes() {
  localStorage.setItem(memoryKey, JSON.stringify(memoryNotes));
}

function appendBubble(role, text, time) {
  const bubble = document.createElement('article');
  bubble.className = `bubble ${role === 'assistant' ? 'incoming' : 'outgoing'}`;
  bubble.innerHTML = `<p>${text}</p><span>${time}</span>`;
  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;
}

function renderChat() {
  title.textContent = 'AI Assistant';
  note.textContent = 'Your AI memory and chat context are saved locally.';
  feed.innerHTML = '';

  if (chatHistory.length === 0) {
    const welcome = 'Hello! Ask me anything about campaigns, ads, publishing, or investments.';
    chatHistory.push({ role: 'assistant', text: welcome, time: formatTime() });
    saveChatHistory();
  }

  chatHistory.forEach((message) => {
    appendBubble(message.role, message.text, message.time);
  });
}

function addMessage(role, text) {
  const time = formatTime();
  chatHistory.push({ role, text, time });
  saveChatHistory();
  appendBubble(role, text, time);
}

async function askAI(prompt) {
  try {
    const response = await fetch(`${backendUrl}/api/ai/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        sessionId,
        history: chatHistory.map((message) => ({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.text })),
        memory: memoryNotes,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reach AI service.');
    }
    return data.response;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'Sorry, there was an error generating the response. Please try again later.';
  }
}

composer.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage('user', text);
  input.value = '';

  const aiText = await askAI(text);
  addMessage('assistant', aiText);
});

newChatBtn.addEventListener('click', () => {
  chatHistory = [];
  saveChatHistory();
  renderChat();
});

quickReplyBtn.addEventListener('click', async () => {
  if (chatHistory.length === 0) return;
  const prompt = 'Write a short professional follow-up message for this conversation.';
  const aiText = await askAI(prompt);
  addMessage('assistant', aiText);
});

renderChat();
