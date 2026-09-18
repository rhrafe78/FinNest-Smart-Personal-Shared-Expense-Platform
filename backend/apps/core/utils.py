from decimal import Decimal, ROUND_HALF_UP

def to_decimal(val) -> Decimal:
    """Converts a value to a 2-decimal rounded Decimal safely without float drift."""
    if val is None:
        return Decimal('0.00')
    if isinstance(val, Decimal):
        return val.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    return Decimal(str(val)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
