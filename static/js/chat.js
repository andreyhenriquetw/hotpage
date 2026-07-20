const ASSISTANT_NAME = "DANIELA LIMA 🔥";
const INITIAL_ASSISTANT_MESSAGE = "Ei... tem alguém aí pra bater papo? 🙊";

const chatArea = document.getElementById("chat-area");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing");
const errorBanner = document.getElementById("error-banner");
const bgVideo = document.querySelector(".bg-video");

let history = [];
let isSending = false;

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.add("visible");
}

function hideError() {
  errorBanner.classList.remove("visible");
  errorBanner.textContent = "";
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addMessage(role, content) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (role === "assistant") {
    const name = document.createElement("span");
    name.className = "sender-name";
    name.textContent = ASSISTANT_NAME;

    const text = document.createElement("span");
    text.className = "message-text";
    text.textContent = content;

    bubble.appendChild(name);
    bubble.appendChild(text);
    // inserir CTA de VIP quando a mensagem mencionar venda de VIPs / chamada de vídeo
    const lower = content.toLowerCase();
    if (/(vip|vips|video|vídeo|chamada)/.test(lower)) {
      showVipButton();
    }
  } else {
    bubble.textContent = content;
  }

  chatArea.insertBefore(wrapper, typingIndicator);
  wrapper.appendChild(bubble);
  scrollToBottom();
}

// --- VIP popup ---
function createVipPopup() {
  if (document.getElementById("vip-popup")) return;

  const popup = document.createElement("div");
  popup.id = "vip-popup";
  popup.className = "vip-popup";

  popup.innerHTML = `
    <div class="vip-card">
      <button class="vip-close" aria-label="Fechar">×</button>
      <div class="vip-header">
        <span class="vip-badge">UPGRADE EXCLUSIVO <span class="vip-badge-icon">💎</span></span>
      </div>
      <h3 class="vip-main-title">QUER O ACESSO <span>TOTAL?</span></h3>
      <p class="vip-subtitle">LIBERE O <strong>VIP COMPLETO</strong> E GANHE ACESSO A:</p>
      <ul class="vip-list">
        <li><span>⭐</span> TIRO A ROUPA TODA E FICO NUA PRA VOCÊ</li>
        <li><span>⭐</span> ME MASTURBO BEM GOSTOSO COM VOCÊ AO VIVO</li>
        <li><span>⭐</span> PASSO MEU WHATSAPP PESSOAL AGORA</li>
        <li><span>⭐</span> A GENTE MARCA DE SE VER AÍ</li>
      </ul>
      <a class="vip-pill" href="/comprar-vip" target="_blank" rel="noopener">🔒 SIGILO TOTAL</a>
      <div class="vip-offer-label">OFERTA ÚNICA</div>
      <div class="vip-pricing">
        <span class="vip-old-price">De R$ 39,98</span>
        <strong class="vip-price">R$ 19,99</strong>
      </div>
      <div class="vip-actions">
        <a class="vip-action vip-action-primary" href="/comprar-vip" target="_blank" rel="noopener">ACESSO COMPLETO (R$ 19,99)</a>
        <a class="vip-action vip-action-secondary" href="/comprar-basico" target="_blank" rel="noopener">ACESSO BÁSICO (R$ 12,99)</a>
      </div>
    </div>
  `;

  popup.querySelector(".vip-close").addEventListener("click", hideVipPopup);
  popup.addEventListener("click", (ev) => {
    if (ev.target === popup) hideVipPopup();
  });

  document.body.appendChild(popup);
}

function showVipPopup() {
  createVipPopup();
  const popup = document.getElementById("vip-popup");
  if (!popup) return;
  requestAnimationFrame(() => popup.classList.add("visible"));
}

function hideVipPopup() {
  const popup = document.getElementById("vip-popup");
  if (!popup) return;
  popup.classList.remove("visible");
}

// --- VIP floating button (outside message bubble) ---
function createVipButton() {
  if (document.getElementById("vip-floating")) return;

  const container = document.createElement("div");
  container.id = "vip-floating";
  container.className = "vip-floating";

  container.innerHTML = `
    <button type="button" class="vip-floating-btn">
      <span class="vip-lock">🔒</span>
      <span class="vip-label">LIBERAR VIP</span>
    </button>
  `;

  container
    .querySelector(".vip-floating-btn")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      showVipPopup();
    });

  const overlay = document.querySelector(".ui-overlay") || document.body;
  overlay.appendChild(container);
}

function showVipButton() {
  createVipButton();
  const btn = document.getElementById("vip-floating");
  if (!btn) return;
  btn.classList.add("visible");
  // adicionar classe à área de chat para criar espaço quando o botão aparece
  if (chatArea) chatArea.classList.add("vip-cta-visible");
  // garantir que o chat role para cima para não ficar escondido pelo botão
  requestAnimationFrame(() => {
    scrollToBottom();
    // adicionar margem extra ao último balão para não ficar perto do botão
    const last = chatArea && chatArea.querySelector(".message:last-of-type");
    if (last) last.classList.add("above-vip");
  });
}

function hideVipButton() {
  const btn = document.getElementById("vip-floating");
  if (!btn) return;
  btn.classList.remove("visible");
  if (chatArea) chatArea.classList.remove("vip-cta-visible");
  // remover margem extra do último balão
  const last = chatArea && chatArea.querySelector(".message.above-vip");
  if (last) last.classList.remove("above-vip");
}

function setLoading(loading) {
  isSending = loading;
  sendBtn.disabled = loading;
  userInput.disabled = loading;
  typingIndicator.classList.toggle("visible", loading);
  scrollToBottom();
}

function autoResizeTextarea() {
  userInput.style.height = "auto";
  userInput.style.height = `${Math.min(userInput.scrollHeight, 100)}px`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || isSending) return;

  hideError();
  addMessage("user", message);
  userInput.value = "";
  autoResizeTextarea();
  setLoading(true);

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível obter resposta.");
    }

    history.push({ role: "user", content: message });

    if (data.response && data.response.length > 20) {
      await delay(6000);
    }

    history.push({ role: "assistant", content: data.response });
    addMessage("assistant", data.response);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

function initBackgroundVideo() {
  if (!bgVideo) return;

  bgVideo.addEventListener("loadeddata", () => {
    bgVideo.classList.add("is-playing");
  });

  bgVideo.addEventListener("error", () => {
    bgVideo.style.display = "none";
  });

  bgVideo
    .play()
    .then(() => {
      bgVideo.classList.add("is-playing");
    })
    .catch(() => {
      bgVideo.style.display = "none";
    });
}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener("input", autoResizeTextarea);

function showInitialAssistantMessage() {
  addMessage("assistant", INITIAL_ASSISTANT_MESSAGE);
  history.push({ role: "assistant", content: INITIAL_ASSISTANT_MESSAGE });
}

initBackgroundVideo();
showInitialAssistantMessage();
userInput.focus();
