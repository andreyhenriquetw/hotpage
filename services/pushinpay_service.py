import json
import urllib.error
import urllib.parse
import urllib.request

from config import Config


PLAN_PRICES = {
    "vip-completo": 1.00,
    "vip-basico": 1.00,
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
        "currency": "BRL",
    }

    if Config.PUSHINPAY_WEBHOOK_URL:
        payload["webhook_url"] = Config.PUSHINPAY_WEBHOOK_URL

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

    status = (
        response.get("status")
        or response.get("payment_status")
        or response.get("transaction_status")
        or response.get("state")
        or "pending"
    )

    normalized_status = str(status).strip().lower()
    if normalized_status in {"paid", "pago", "confirmed", "approved", "completed"}:
        normalized_status = "paid"
    elif normalized_status in {"pending", "processing", "waiting", "created", "in_progress"}:
        normalized_status = "pending"
    else:
        normalized_status = normalized_status or "pending"

    return {
        "transaction_id": (
            response.get("id")
            or response.get("transaction_id")
            or response.get("transactionId")
            or response.get("codigo")
            or response.get("charge_id")
        ),
        "pix_code": (
            response.get("pix_code")
            or response.get("pix")
            or response.get("copy_paste")
            or response.get("payload")
            or response.get("qr_code")
            or response.get("qrcode")
            or response.get("qr")
        ),
        "qr_code": (
            response.get("qr_code_base64")
            or response.get("qr_base64")
            or response.get("qr_code")
            or response.get("qrcode")
            or response.get("qr")
        ),
        "amount": (
            response.get("amount")
            or response.get("value")
            or f"{value / 100:.2f}"
        ),
        "status": normalized_status,
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

    status = (
        response.get("status")
        or response.get("payment_status")
        or response.get("transaction_status")
        or response.get("state")
        or "pending"
    )

    normalized_status = str(status).strip().lower()
    if normalized_status in {"paid", "pago", "confirmed", "approved", "completed"}:
        normalized_status = "paid"
    elif normalized_status in {"pending", "processing", "waiting", "created", "in_progress"}:
        normalized_status = "pending"
    else:
        normalized_status = normalized_status or "pending"

    return {
        "transaction_id": (
            response.get("id")
            or response.get("transaction_id")
            or response.get("transactionId")
            or transaction_id
        ),
        "status": normalized_status,
    }