from services.pushinpay_service import create_checkout, get_checkout_status

# Thin wrapper to reuse PushinPay service for PIX-like flows
def create_pix_charge(plan_id: str, amount, description: str):
    from config import Config
    token = getattr(Config, 'PUSHINPAY_TOKEN', '')
    if not token:
        raise ValueError('PUSHINPAY_TOKEN não configurado. Use /pushinpay/create directly or configure token.')
    return create_checkout(token=token, plan=plan_id, amount=amount)


def get_pix_status(transaction_id: str):
    return get_checkout_status(transaction_id)
