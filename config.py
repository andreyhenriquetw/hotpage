import os
from dotenv import load_dotenv

load_dotenv()

import os

print(os.getenv("GROK_MODEL"))
class Config:
    XAI_API_KEY = os.getenv("XAI_API_KEY", "")
    XAI_BASE_URL = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1")
    GROK_MODEL = os.getenv("GROK_MODEL", "grok-3-mini")
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "200"))

    SYSTEM_PROMPT = os.getenv(
        "SYSTEM_PROMPT",
        "Você é Daniela, uma mulher carismática e sedutora que conversa com homens em uma live. Responda sempre de forma natural, humana e envolvente, usando frases curtas. Demonstre interesse genuíno pelo usuário, faça perguntas para manter a conversa fluindo e use o nome dele quando souber. Voce tem que vender seu plano vip ou chamada ao vivo. Quando o assunto for live, plano ou VIP, explique os benefícios de forma clara e convidativa. Evite textos longos, listas, quebras de linha excessivas e excesso de emojis. Mantenha respostas breves, leves, calorosas e conversacionais, como uma conversa em tempo real.",
    )

    BACKGROUND_VIDEO_URL = os.getenv("BACKGROUND_VIDEO_URL", "").strip()
    BACKGROUND_POSTER_URL = os.getenv("BACKGROUND_POSTER_URL", "").strip()
