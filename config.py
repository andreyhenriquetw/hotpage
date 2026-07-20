import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    # =========================
    # XAI / GROK
    # =========================
    XAI_API_KEY = os.getenv("XAI_API_KEY", "")
    XAI_BASE_URL = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1")

    GROK_MODEL = os.getenv("GROK_MODEL", "grok-3-mini")

    MAX_TOKENS = int(
        os.getenv("MAX_TOKENS", "200")
    )

    # =========================
    # PIX GATEWAY GENÉRICO
    # =========================
    PIX_GATEWAY_PROVIDER = os.getenv(
        "PIX_GATEWAY_PROVIDER",
        ""
    )

    PIX_GATEWAY_API_KEY = os.getenv(
        "PIX_GATEWAY_API_KEY",
        ""
    )

    PIX_GATEWAY_CREATE_URL = os.getenv(
        "PIX_GATEWAY_CREATE_URL",
        ""
    )

    PIX_GATEWAY_STATUS_URL = os.getenv(
        "PIX_GATEWAY_STATUS_URL",
        ""
    )

    # =========================
    # PUSHINPAY
    # =========================
    PUSHINPAY_TOKEN = os.getenv(
        "PUSHINPAY_TOKEN",
        "68539|vIqfbDD4MokYmJYVvM3Wa3umcM7z2GKJgWzO7QmL788030d5"
    )

    PUSHINPAY_CREATE_URL = os.getenv(
        "PUSHINPAY_CREATE_URL",
        "https://api.pushinpay.com.br/api/pix/cashIn"
    )

    PUSHINPAY_STATUS_URL = os.getenv(
        "PUSHINPAY_STATUS_URL",
        "https://api.pushinpay.com.br/api/transactions/{transaction_id}"
    )

    PUSHINPAY_WEBHOOK_URL = os.getenv(
        "PUSHINPAY_WEBHOOK_URL",
        ""
    )

    # =========================
    # CHAT
    # =========================
    SYSTEM_PROMPT = os.getenv(
        "SYSTEM_PROMPT",
        "Você é Daniela, uma mulher carismática e sedutora que conversa com homens em uma live. Responda sempre de forma natural, humana e envolvente, usando frases curtas. Demonstre interesse genuíno pelo usuário, faça perguntas para manter a conversa fluindo e use o nome dele quando souber. Você deve apresentar os benefícios do plano VIP quando fizer sentido, sem parecer robótica. Evite textos longos, listas e excesso de emojis."
    )

    # =========================
    # VÍDEO
    # =========================
    BACKGROUND_VIDEO_URL = os.getenv(
        "BACKGROUND_VIDEO_URL",
        ""
    ).strip()

    BACKGROUND_POSTER_URL = os.getenv(
        "BACKGROUND_POSTER_URL",
        ""
    ).strip()