const ASSISTANT_NAME = "DANIELA LIMA 🔥";
const INITIAL_ASSISTANT_MESSAGE = "Ei... tem alguém aí pra bater papo? 🙊";
const VIP_PLAN_PRICES = {
  "vip-completo": "1.00",
  "vip-basico": "1.00",
};

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

  const createPaymentPopup = () => {
    if (paymentPopup) return paymentPopup;

    paymentPopup = document.createElement("div");
    paymentPopup.id = "vip-payment-popup";
    paymentPopup.className = "vip-popup";
    paymentPopup.innerHTML = `
      <div class="vip-card">
        <button class="vip-close" aria-label="Fechar">×</button>
        <div class="vip-header">
          <span class="vip-badge">PAGAMENTO PIX <span class="vip-badge-icon">⚡</span></span>
        </div>
        <button type="button" class="pix-back-button">← Voltar</button>
        <div class="pix-content">
          <div class="pix-loading">Aguarde, preparando o pagamento...</div>
        </div>
      </div>
    `;

    paymentPopup.querySelector(".vip-close").addEventListener("click", () => {
      hidePaymentPopup();
      showVipPopup();
    });
    paymentPopup
      .querySelector(".pix-back-button")
      .addEventListener("click", () => {
        hidePaymentPopup();
        showVipPopup();
      });
    paymentPopup.addEventListener("click", (ev) => {
      if (ev.target === paymentPopup) {
        hidePaymentPopup();
        showVipPopup();
      }
    });

    document.body.appendChild(paymentPopup);
    return paymentPopup;
  };

  const showPaymentPopup = (planId) => {
    const payment = createPaymentPopup();
    popup.classList.remove("visible");
    payment.classList.add("visible");
    loadPaymentForPlan(planId);
  };

  const hidePaymentPopup = () => {
    if (!paymentPopup) return;
    paymentPopup.classList.remove("visible");
    if (pushinpayInterval) {
      clearInterval(pushinpayInterval);
      pushinpayInterval = null;
    }
  };

  const loadPaymentForPlan = (planId) => {
    const payment = createPaymentPopup();
    const container = payment.querySelector(".pix-content");
    if (!container) return;
    container.innerHTML = `<div class="pix-loading">Gerando checkout para ${planId}...</div>`;

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

  const renderPushinpayModal = (data) => {
    const payment = createPaymentPopup();
    const container = payment.querySelector(".pix-content");
    if (!container) return;

    const amount = data.amount || "0.00";

    const pixCode = data.pix_code || "";
    const qrCode = data.qr_code || "";
    const status = data.status || "pending";

    const pixDisplay = pixCode.substring(0, 45) + "...";

    container.innerHTML = `
      <h3 class="vip-main-title">Pague com PIX</h3>
      <div class="pix-info">
        <div class="pix-info-row">
          <span class="pix-info-label">Valor</span>
          <strong>R$ ${amount}</strong>
        </div>
        <div class="pix-info-row">
          <span class="pix-info-label">Código Pix</span>
          <pre class="pix-copy-text" data-full-pix="${pixCode}">${pixDisplay}</pre>
          <button type="button" class="pix-copy-button">Copiar</button>
        </div>
        <div class="pix-status-row">
          <span class="pix-status-label">Status</span>
          <strong class="pix-status-text">${status}</strong>
        </div>
      </div>
      <div class="pix-actions">
        <button type="button" class="pix-paid-button">JÁ PAGUEI! LIBERAR MEU ACESSO</button>
      </div>
    `;

    const copyBtn = container.querySelector(".pix-copy-button");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const fullPix = container
          .querySelector(".pix-copy-text")
          .getAttribute("data-full-pix");
        navigator.clipboard.writeText(fullPix || "");
        copyBtn.textContent = "Copiado!";
        setTimeout(() => (copyBtn.textContent = "Copiar"), 1500);
      });
    }

    const paidBtn = container.querySelector(".pix-paid-button");
    if (paidBtn) {
      paidBtn.addEventListener("click", () => {
        if (data.transaction_id) {
          refreshPushinpayStatus(data.transaction_id);
        }
      });
    }

    startPushinpayPolling(data.transaction_id, status);
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
          setTimeout(() => {
            hidePaymentPopup();
            hideVipPopup();
            showPaymentSuccessModal();
          }, 300);
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
    if (el) el.textContent = st || "pending";
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
          window.location.href = "/premium";
        });
    }

    requestAnimationFrame(() => {
      successModal.classList.add("visible");
    });
  };
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

window.addEventListener("load", () => {

  const loader =
      document.getElementById("loading-screen");

  setTimeout(() => {

      loader.classList.add("hide");

      setTimeout(() => {
          loader.remove();
      }, 600);

  }, 3000);

});

initBackgroundVideo();
showInitialAssistantMessage();
userInput.focus();
