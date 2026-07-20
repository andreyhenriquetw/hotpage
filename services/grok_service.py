from openai import OpenAI

from config import Config


def get_client() -> OpenAI:
    return OpenAI(
        api_key=Config.XAI_API_KEY,
        base_url=Config.XAI_BASE_URL,
    )


def chat_with_grok(messages: list[dict]) -> str:
    if not Config.XAI_API_KEY:
        raise ValueError(
            "Chave da API não configurada. Defina XAI_API_KEY no arquivo .env"
        )

    client = get_client()

    full_messages = [{"role": "system", "content": Config.SYSTEM_PROMPT}, *messages]

    response = client.chat.completions.create(
        model=Config.GROK_MODEL,
        messages=full_messages,
        max_tokens=Config.MAX_TOKENS,
    )

    return response.choices[0].message.content.strip()
