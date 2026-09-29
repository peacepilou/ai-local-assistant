const MODEL_NAME = "tacos-logs";
const WELCOME_MESSAGE =
  "Salut ! Colle-moi les logs de la boutique, je te dis ce qui cloche.";

const SUGGESTIONS = [
  "Quelle est la cause du problème ?",
  "Quelles commandes sont touchées ?",
  "Montre-moi la ligne qui le prouve.",
];

// L'adresse d'Ollama sur ta machine : 11434 est le port où il écoute
const OLLAMA_URL = "http://localhost:11434/api/chat";

const messages = [];

// ============================================================
// 3. Les éléments de la page
// ============================================================

const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const chat = document.querySelector("#chat");
const sendButton = document.querySelector("#send-button");
const suggestions = document.querySelector("#suggestions");
const resetButton = document.querySelector("#reset-button");

function addBubble(role, text) {
  const bubble = document.createElement("p");
  bubble.classList.add("bubble", `bubble-${role}`);
  bubble.textContent = text;
  chat.appendChild(bubble);
  bubble.scrollIntoView();
  return bubble;
}

function addUserBubble(text) {
  const lines = text.trimEnd().split("\n");
  if (lines.length <= 5) {
    return addBubble("user", text);
  }
  const bubble = addBubble("user", `${lines.length} lignes collées`);
  bubble.classList.add("bubble-logs");
  const preview = document.createElement("span");
  preview.classList.add("logs-preview");
  preview.textContent = lines[0];
  bubble.appendChild(preview);
  return bubble;
}

function startConversation() {
  messages.length = 0;
  chat.innerHTML = "";
  messages.push({ role: "assistant", content: WELCOME_MESSAGE });
  addBubble("assistant", WELCOME_MESSAGE);
}

// ============================================================
// 4. Demander une réponse au modèle
// ============================================================

async function askAssistant(conversation) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: conversation,
      think: false, // pas de brouillon « Thinking… » : la réponse directement
      stream: false, // la réponse en un seul bloc, quand elle est finie
    }),
  });

  const data = await response.json();

  // response.ok vaut false si Ollama a répondu par une erreur (modèle introuvable...)
  if (!response.ok) {
    throw new Error(data.error);
  }

  return data.message.content;
}

// ============================================================
// 5. Envoyer un message
// ============================================================

async function sendMessage(text) {
  if (!text.trim()) {
    return;
  }
  addUserBubble(text);
  messages.push({ role: "user", content: text });

  // Pendant l'attente : bouton grisé, et un compteur de secondes.
  // Lire 250 lignes de logs peut prendre une minute sur un petit ordinateur.
  form.classList.add("is-loading");
  sendButton.disabled = true;
  const thinking = addBubble("thinking", "Le modèle lit… 0 s");
  const start = Date.now();
  const timer = setInterval(() => {
    const seconds = Math.round((Date.now() - start) / 1000);
    thinking.textContent = `Le modèle lit… ${seconds} s`;
  }, 1000);

  try {
    const answer = await askAssistant(messages);
    messages.push({ role: "assistant", content: answer });
    addBubble("assistant", answer);
  } catch (error) {
    addBubble("error", `Oups : ${error.message} (le détail est dans la console, F12)`);
    console.error(error);
  }

  clearInterval(timer);
  thinking.remove();
  form.classList.remove("is-loading");
  sendButton.disabled = false;
}

// ============================================================
// 6. Brancher la page
// ============================================================

form.addEventListener("submit", (event) => {
  event.preventDefault(); // pas de rechargement de la page
  const text = input.value;
  input.value = "";
  sendMessage(text);
});

// Entrée envoie, Maj + Entrée va à la ligne
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

for (const suggestion of SUGGESTIONS) {
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("suggestion");
  button.textContent = suggestion;
  button.addEventListener("click", () => sendMessage(suggestion));
  suggestions.appendChild(button);
}

resetButton.addEventListener("click", startConversation);

startConversation();
