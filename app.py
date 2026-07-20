from flask import Flask, jsonify, render_template, request

from config import Config
from services.grok_service import chat_with_grok

app = Flask(__name__)


@app.route("/")
def index():
    return render_template(
        "index.html",
        video_url=Config.BACKGROUND_VIDEO_URL,
        poster_url=Config.BACKGROUND_POSTER_URL,
    )


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()
    history = data.get("history") or []

    if not user_message:
        return jsonify({"error": "Mensagem vazia."}), 400

    if not Config.XAI_API_KEY:
        return jsonify(
            {"error": "Configure a chave XAI_API_KEY no arquivo .env para usar a IA."}
        ), 500

    messages = [
        *[
            {"role": item["role"], "content": item["content"]}
            for item in history
            if item.get("role") in ("user", "assistant") and item.get("content")
        ],
        {"role": "user", "content": user_message},
    ]

    try:
        reply = chat_with_grok(messages)
        return jsonify({"response": reply})
    except Exception as exc:
        return jsonify({"error": f"Erro ao contactar a IA: {exc}"}), 502


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
