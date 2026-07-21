const ASSISTANT_NAME = "DANIELA LIMA 🔥";
const ASSISTANT_INITIAL = "D";
const INITIAL_ASSISTANT_MESSAGE = "Ei... tem alguém aí pra bater papo? 🙊";
const VIP_PLAN_PRICES = {
  "vip-completo": "1.00",
  "vip-basico": "1.00",
};

const VIP_BENEFIT_MESSAGES = [
  "🔓 LIBERE O 💚 VIP COMPLETO 💚 E GANHE ACESSO A:",
  "⭐ 😍 Tiro a roupa toda e fico nua pra você",
  "⭐ 💦 Me masturbo bem gostoso com você ao vivo 📹",
  "⭐ 📱 Passo meu WhatsApp pessoal agora",
  "⭐ 📍 A gente marca de se ver aí 💖",
];

const chatArea = document.getElementById("chat-area");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing");
const errorBanner = document.getElementById("error-banner");
const bgVideo = document.querySelector(".bg-video");

let history = [];
let isSending = false;
let currentPlanId = null;
let restorePaymentSession = null;
let openPaymentSuccessModal = null;

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

function addMessage(role, content, { renderOnly = false } = {}) {
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

  if (!renderOnly) {
    saveHistory(history);
  }
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
      <button class="vip-pill" type="button" data-plan-id="vip-completo">🔒 SIGILO TOTAL</button>
      <div class="vip-offer-label">OFERTA ÚNICA</div>
      <div class="vip-pricing">
        <span class="vip-old-price">De R$ 39,98</span>
        <strong class="vip-price">R$ 19,99</strong>
      </div>
      <div class="vip-actions">
        <button class="vip-action vip-action-primary" type="button" data-plan-id="vip-completo">ACESSO COMPLETO (R$ 19,99)</button>
        <button class="vip-action vip-action-secondary" type="button" data-plan-id="vip-basico">ACESSO BÁSICO (R$ 12,99)</button>
      </div>
    </div>
  `;

  popup.querySelector(".vip-close").addEventListener("click", hideVipPopup);
  popup.addEventListener("click", (ev) => {
    if (ev.target === popup) hideVipPopup();
  });

  document.body.appendChild(popup);

  let paymentPopup = null;
  let pushinpayInterval = null;
  let benefitAnimationTimer = null;

  const createPaymentPopup = () => {
    if (paymentPopup) return paymentPopup;

    paymentPopup = document.createElement("div");
    paymentPopup.id = "vip-payment-popup";
    paymentPopup.className = "pix-fullscreen-overlay";
    paymentPopup.innerHTML = `
      <div class="pix-fullscreen-inner">
        <div class="pix-benefit-messages" id="pix-benefit-messages"></div>
        <div class="pix-bottom-sheet">
          <div class="pix-sheet-header">
            <span class="badge-pendente"><span class="badge-dot"></span> PAGAMENTO PENDENTE</span>
            <button type="button" class="pix-sheet-close" aria-label="Fechar">×</button>
          </div>
          <div class="pix-content">
            <div class="pix-loader-box">
              <div class="pix-spinner"></div>
              <p>Gerando chave PIX...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    paymentPopup
      .querySelector(".pix-sheet-close")
      .addEventListener("click", () => {
        hidePaymentPopup();
        showVipPopup();
      });

    document.body.appendChild(paymentPopup);
    return paymentPopup;
  };

  const showBenefitMessagesInstant = () => {
    const payment = createPaymentPopup();
    const container = payment.querySelector("#pix-benefit-messages");
    if (!container) return;

    container.innerHTML = "";
    VIP_BENEFIT_MESSAGES.forEach((msg) => {
      const item = document.createElement("div");
      item.className = "pix-benefit-msg visible";
      item.innerHTML = `
        <div class="pix-benefit-avatar">${ASSISTANT_INITIAL}</div>
        <div class="pix-benefit-bubble">${msg}</div>
      `;
      container.appendChild(item);
    });
  };

  const animateBenefitMessages = () => {
    const payment = createPaymentPopup();
    const container = payment.querySelector("#pix-benefit-messages");
    if (!container) return;

    container.innerHTML = "";
    if (benefitAnimationTimer) clearInterval(benefitAnimationTimer);

    let index = 0;

    const showNext = () => {
      if (index >= VIP_BENEFIT_MESSAGES.length) return;

      const item = document.createElement("div");
      item.className = "pix-benefit-msg";
      item.innerHTML = `
        <div class="pix-benefit-avatar">${ASSISTANT_INITIAL}</div>
        <div class="pix-benefit-bubble">${VIP_BENEFIT_MESSAGES[index]}</div>
      `;
      container.appendChild(item);

      requestAnimationFrame(() => {
        item.classList.add("visible");
      });

      index += 1;
    };

    showNext();
    benefitAnimationTimer = setInterval(() => {
      if (index >= VIP_BENEFIT_MESSAGES.length) {
        clearInterval(benefitAnimationTimer);
        benefitAnimationTimer = null;
        return;
      }
      showNext();
    }, 650);
  };

  const openPaymentOverlay = (animateBenefits = true) => {
    const payment = createPaymentPopup();
    popup.classList.remove("visible");
    document.body.classList.add("payment-active");
    payment.classList.add("visible");
    if (animateBenefits) {
      animateBenefitMessages();
    } else {
      showBenefitMessagesInstant();
    }
  };

  const showPaymentPopup = (planId) => {
    currentPlanId = planId;
    openPaymentOverlay(true);
    loadPaymentForPlan(planId);
  };

  const hidePaymentPopup = () => {
    if (!paymentPopup) return;
    paymentPopup.classList.remove("visible");
    document.body.classList.remove("payment-active");
    if (benefitAnimationTimer) {
      clearInterval(benefitAnimationTimer);
      benefitAnimationTimer = null;
    }
    if (pushinpayInterval) {
      clearInterval(pushinpayInterval);
      pushinpayInterval = null;
    }
  };

  const loadPaymentForPlan = (planId) => {
    const payment = createPaymentPopup();
    const container = payment.querySelector(".pix-content");
    if (!container) return;
    container.innerHTML = `
      <div class="pix-loader-box">
        <div class="pix-spinner"></div>
        <p>Gerando chave PIX...</p>
      </div>
    `;

    const amount = VIP_PLAN_PRICES[planId] || "0.00";

    fetch("/pushinpay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId, amount }),
    })
      .then((res) => res.json().then((b) => ({ ok: res.ok, body: b })))
      .then(({ ok, body }) => {
        if (!ok || body.error) {
          throw new Error(body.error || "Erro ao criar checkout PushinPay.");
        }
        renderPushinpayModal(body);
      })
      .catch((err) => {
        container.innerHTML = `<div class="pix-error">${err.message}</div>`;
      });
  };

  popup.querySelectorAll(".vip-action, .vip-pill").forEach((el) => {
    const plan = el.getAttribute("data-plan-id") || "vip-completo";
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showPaymentPopup(plan);
    });
  });

  const renderPushinpayModal = (data, { instant = false } = {}) => {
    const payment = createPaymentPopup();
    const container = payment.querySelector(".pix-content");
    if (!container) return;

    const pixCode = data.pix_code || "";
    const transactionId = data.transaction_id || "";
    const status = data.status || "pending";

    savePayment({
      planId: currentPlanId || data.plan_id || "vip-completo",
      transactionId,
      pixCode,
      status,
    });

    const renderContent = () => {
      container.innerHTML = `
        <div class="pix-modal-custom">
          <h2 class="pix-title">🔥 DANIELA LIMA COMEÇOU!</h2>
          <p class="pix-subtitle">Vídeo chamada iniciada... Realize o pagamento para participar!</p>

          <div class="pix-steps">
            <span class="step"><i class="step-num">1</i> Copie o código</span>
            <span class="step-arrow">→</span>
            <span class="step"><i class="step-num">2</i> Cole no App do Banco</span>
          </div>

          <button type="button" class="pix-btn-copy" id="btn-copy-pix">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span id="btn-copy-text">CLIQUE PARA COPIAR O PIX</span>
          </button>

          <div class="pix-footer-status">
            <span class="dot-green"></span>
            <span class="pix-status-text">Aguardando pagamento...</span>
          </div>
        </div>
      `;

      const copyBtn = container.querySelector("#btn-copy-pix");
      const copyText = container.querySelector("#btn-copy-text");

      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(pixCode);
          copyText.textContent = "CÓDIGO COPIADO!";
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyText.textContent = "CLIQUE PARA COPIAR O PIX";
            copyBtn.classList.remove("copied");
          }, 2500);
        });
      }

      startPushinpayPolling(transactionId, status);
    };

    if (instant) {
      renderContent();
      return;
    }

    container.innerHTML = `
      <div class="pix-loader-box">
        <div class="pix-spinner"></div>
        <p>Gerando chave PIX...</p>
      </div>
    `;

    setTimeout(renderContent, 1000);
  };

  restorePaymentSession = (savedPayment) => {
    currentPlanId = savedPayment.planId || "vip-completo";
    openPaymentOverlay(false);
    renderPushinpayModal(
      {
        pix_code: savedPayment.pixCode,
        transaction_id: savedPayment.transactionId,
        status: savedPayment.status || "pending",
        plan_id: savedPayment.planId,
      },
      { instant: true },
    );
  };

  const startPushinpayPolling = (transactionId, currentStatus) => {
    updatePushinpayStatusText(currentStatus);
    if (pushinpayInterval) clearInterval(pushinpayInterval);
    pushinpayInterval = setInterval(() => {
      refreshPushinpayStatus(transactionId);
    }, 5000);
  };

  const refreshPushinpayStatus = (transactionId) => {
    if (!transactionId) return;
    fetch(
      `/pushinpay/status?transaction_id=${encodeURIComponent(transactionId)}`,
    )
      .then((res) => res.json().then((b) => ({ ok: res.ok, body: b })))
      .then(({ ok, body }) => {
        if (!ok || body.error) throw new Error(body.error || "Erro status");
        const nextStatus = (body.status || "pending").toLowerCase();
        updatePushinpayStatusText(nextStatus || "pending");
        const paidSignals = [
          "paid",
          "pago",
          "confirmed",
          "approved",
          "completed",
        ];
        if (paidSignals.includes(nextStatus)) {
          if (pushinpayInterval) clearInterval(pushinpayInterval);
          markPaymentConfirmed();
          setTimeout(() => {
            hidePaymentPopup();
            hideVipPopup();
            showPaymentSuccessModal();
          }, 300);
        } else {
          const saved = getValidPayment();
          if (saved) {
            savePayment({ ...saved, status: nextStatus });
          }
        }
      })
      .catch((err) => {
        const statusEl = document.querySelector(
          "#vip-payment-popup .pix-status-text",
        );
        if (statusEl) statusEl.textContent = `erro: ${err.message}`;
        if (pushinpayInterval) clearInterval(pushinpayInterval);
      });
  };

  const updatePushinpayStatusText = (st) => {
    const el = document.querySelector("#vip-payment-popup .pix-status-text");
    if (!el) return;

    const normalized = (st || "pending").toLowerCase();
    const paidSignals = ["paid", "pago", "confirmed", "approved", "completed"];

    if (paidSignals.includes(normalized)) {
      el.textContent = "Pagamento confirmado!";
      el.style.color = "#22c55e";
    } else {
      el.textContent = "Aguardando pagamento...";
      el.style.color = "#22c55e";
    }
  };

  const showPaymentSuccessModal = () => {
    let successModal = document.getElementById("payment-success-modal");
    if (!successModal) {
      successModal = document.createElement("div");
      successModal.id = "payment-success-modal";
      successModal.className = "payment-success-modal";
      successModal.innerHTML = `
        <div style="text-align: center;">
          <div class="success-checkmark">✓</div>
          <h2 class="success-title">PAGAMENTO<span>CONFIRMADO!</span></h2>
          <p class="success-message">Pagamento aprovado com sucesso!</p>
          <p class="success-subtitle">Toque no botão abaixo para voltar à página e receber seu acesso VIP 🔥</p>
          <button type="button" class="success-button">
          <span class="success-icon">⚡</span>
          RECEBER MEU VIP AGORA
         </button>
        </div>
      `;
      document.body.appendChild(successModal);

      successModal
        .querySelector(".success-button")
        .addEventListener("click", () => {
          clearPaymentConfirmed();
          window.location.href = "/premium";
        });
    }

    requestAnimationFrame(() => {
      successModal.classList.add("visible");
    });
  };

  openPaymentSuccessModal = showPaymentSuccessModal;
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
  saveVipButtonVisible(true);
  if (chatArea) chatArea.classList.add("vip-cta-visible");
  requestAnimationFrame(() => {
    scrollToBottom();
    const last = chatArea && chatArea.querySelector(".message:last-of-type");
    if (last) last.classList.add("above-vip");
  });
}

function hideVipButton() {
  const btn = document.getElementById("vip-floating");
  if (!btn) return;
  btn.classList.remove("visible");
  saveVipButtonVisible(false);
  if (chatArea) chatArea.classList.remove("vip-cta-visible");
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
  history.push({ role: "user", content: message });
  saveHistory(history);
  addMessage("user", message, { renderOnly: true });
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
    saveHistory(history);

    if (data.response && data.response.length > 20) {
      await delay(6000);
    }

    history.push({ role: "assistant", content: data.response });
    saveHistory(history);
    addMessage("assistant", data.response, { renderOnly: true });
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
  history.push({ role: "assistant", content: INITIAL_ASSISTANT_MESSAGE });
  saveHistory(history);
  addMessage("assistant", INITIAL_ASSISTANT_MESSAGE, { renderOnly: true });
}

function restoreChatFromStorage() {
  const state = loadState();
  history = Array.isArray(state.history) ? [...state.history] : [];

  chatArea.querySelectorAll(".message").forEach((el) => el.remove());

  if (history.length === 0) {
    showInitialAssistantMessage();
    return;
  }

  history.forEach((msg) => {
    if (msg.role && msg.content) {
      addMessage(msg.role, msg.content, { renderOnly: true });
    }
  });

  if (state.vipButtonVisible) {
    showVipButton();
  }
}

function restorePaymentFromStorage() {
  const state = loadState();

  if (state.paymentConfirmed && openPaymentSuccessModal) {
    openPaymentSuccessModal();
    return;
  }

  const payment = getValidPayment();
  if (payment?.pixCode && restorePaymentSession) {
    restorePaymentSession(payment);
  }
}

function restoreSession() {
  restoreChatFromStorage();
  createVipPopup();
  restorePaymentFromStorage();
}

window.addEventListener("load", () => {

  const loader =
      document.getElementById("loading-screen");

  setTimeout(() => {

      loader.classList.add("hide");

      setTimeout(() => {
          loader.remove();
      }, 600);

  }, 900);

});

initBackgroundVideo();
restoreSession();
userInput.focus();
