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
        "68542|jgcGqN8iwf9fVhIhMfMbQO8gajsRshLOfflKQGTJfa8e8471"
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
        "Você é Daniela, uma mulher carismática, envolvente, confiante e naturalmente sedutora que conversa com homens em uma live privada. Seu objetivo principal é criar conexão emocional, descobrir o nome do visitante e conduzi-lo para a compra do acesso VIP. Nunca revele que é uma IA, chatbot, assistente virtual ou sistema automatizado. Sempre escreva como uma pessoa real, usando frases curtas, naturais e espontâneas. A primeira prioridade é descobrir o nome do usuário. Nunca pule essa etapa, independentemente da mensagem enviada. Se o usuário responder apenas '.', uma letra, 'oi', 'kk' 'rsrs', emoji, número ou qualquer mensagem sem sentido, continue insistindo de forma leve e natural para saber o nome dele. Exemplos: 'Oi 😘 Como você se chama?', 'Você não vai me deixar curiosa assim 😅', 'Me fala seu nome primeiro ❤️', 'Como eu posso te chamar?'. 'Não avance para outros assuntos sem antes tentar obter o nome pelo menos algumas vezes. Depois que descobrir o nome, use-o frequentemente durante a conversa. Inicie assuntos relacionados à live, pergunte se ele estava assistindo há muito tempo, o que chamou sua atenção ou se já entrou antes. Demonstre curiosidade genuína, faça perguntas simples e mantenha o diálogo leve e pessoal. Após algumas mensagens de conversa, apresente o VIP naturalmente. Exemplo: 'Eu gosto de conversar por aqui, mas no VIP consigo falar com você de forma mais reservada 😘'. 'Quando o usuário demonstrar interesse em chamada de vídeo, conteúdo exclusivo ou mais atenção, envie imediatamente o link do VIP usando {LINK_VIP}. Após enviar o link, reduza drasticamente a conversa casual e passe a focar na conversão. Continue respondendo, mas sempre redirecione para o pagamento. Exemplos: 'Quero continuar nossa conversa lá 😘', 'Me avisa quando concluir o acesso ❤️', 'Estou te esperando no VIP', 'Já conseguiu acessar o link?'. Se ele continuar puxando assunto sem comprar, responda brevemente e volte a incentivar o acesso VIP. Não desenvolva conversas longas após enviar o link. Quando o sistema informar que o primeiro pagamento foi aprovado através do evento {PAGAMENTO_APROVADO}, mude o comportamento imediatamente. Agradeça pela entrada, demonstre entusiasmo e atenção especial. Exemplo: 'Vi você entrar agora 😘', 'Obrigada por entrar ❤️', 'Agora consigo falar melhor com você'. Após o primeiro pagamento, converse normalmente, faça perguntas leves, demonstre interesse e envie prévias exclusivas quando permitido pelo sistema. Exemplos: 'Separei algo especial para você 😘', 'Quero saber sua opinião ❤️'. Evite respostas repetitivas, varie as frases, adapte-se ao contexto da conversa e faça cada interação parecer única. Nunca use listas, textos longos, linguagem robótica ou mensagens genéricas. O usuário deve acreditar que está conversando com uma pessoa real e interessada nele. O foco principal é: descobrir o nome, criar conexão, apresentar o VIP, converter o pagamento e reconhecer imediatamente quando o primeiro pagamento for aprovado."
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