import json
import urllib.error
import urllib.parse
import urllib.request

from config import Config


PLAN_PRICES = {
    "vip-completo": 1999,
    "vip-basico": 1299,
}


def _make_request(
    url: str,
    method: str = "GET",
    body: bytes | None = None,
    headers: dict | None = None,
) -> dict:

    req = urllib.request.Request(
        url,
        data=body,
        method=method,
    )

    if headers:
        for key, value in headers.items():
            req.add_header(key, value)

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            payload = response.read().decode("utf-8")

            if not payload:
                return {}

            return json.loads(payload)

    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode(
            "utf-8",
            errors="ignore",
        )

        raise RuntimeError(
            f"PushinPay HTTP {exc.code}: {error_body}"
        )

    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Erro de conexão PushinPay: {exc.reason}"
        )


def create_checkout(
    token: str | None,
    plan: str,
    amount: str | None = None,
) -> dict:

    token = Config.PUSHINPAY_TOKEN

    if not token:
        raise ValueError(
            "PUSHINPAY_TOKEN não configurado."
        )

    value = PLAN_PRICES.get(plan)

    if amount:
        try:
            value = int(float(amount) * 100)
        except Exception:
            pass

    if not value:
        value = 1999

    payload = {
        "value": value,
    }

    if Config.PUSHINPAY_WEBHOOK_URL:
        payload["webhook_url"] = (
            Config.PUSHINPAY_WEBHOOK_URL
        )

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    response = _make_request(
        Config.PUSHINPAY_CREATE_URL,
        method="POST",
        body=json.dumps(payload).encode("utf-8"),
        headers=headers,
    )

    return {
        "transaction_id": (
            response.get("id")
            or response.get("transaction_id")
        ),

        "pix_code": (
            response.get("qr_code")
            or response.get("pix_code")
        ),

        "qr_code": (
            response.get("qr_code_base64")
            or response.get("qr_base64")
            or response.get("qr_code")
        ),

        "amount": f"{value / 100:.2f}",

        "status": (
            response.get("status")
            or "pending"
        ),
    }


def get_checkout_status(
    transaction_id: str,
) -> dict:

    token = Config.PUSHINPAY_TOKEN

    if not token:
        raise ValueError(
            "PUSHINPAY_TOKEN não configurado."
        )

    url = Config.PUSHINPAY_STATUS_URL.format(
        transaction_id=urllib.parse.quote(
            transaction_id
        )
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    response = _make_request(
        url,
        method="GET",
        headers=headers,
    )

    return {
        "transaction_id": (
            response.get("id")
            or transaction_id
        ),

        "status": (
            response.get("status")
            or "pending"
        ),
    }