"""Axle inference for EU brake parts when the supplier page has no Fitting Position.

Sources, in order of trust:
1. TecDoc "Fitting Position" property (Front Axle / Rear Axle).
2. Part-kind rules: drums, shoes and calipers with integrated parking brake are rear.
3. OE part-number families. Carmakers encode the axle in the OE number group, e.g.
   VAG 615 301 = front disc, 615 601 = rear disc, 698 151 = front pads, 698 451 = rear pads;
   BMW 34 11 = front brakes, 34 21 = rear brakes. Only unambiguous families are used.
"""
import re

OE_RULES = [
    # VAG (Audi, VW, Seat, Skoda)
    (r"^[0-9A-Z]{3}615301", "front"), (r"^[0-9A-Z]{3}615601", "rear"),
    (r"^[0-9A-Z]{3}698151", "front"), (r"^[0-9A-Z]{3}698451", "rear"),
    (r"^[0-9A-Z]{3}615123|^[0-9A-Z]{3}615124", "front"), (r"^[0-9A-Z]{3}615423|^[0-9A-Z]{3}615424", "rear"),
    (r"^[0-9A-Z]{3}611701", "front"), (r"^[0-9A-Z]{3}611775", "rear"),
    (r"^[0-9A-Z]{3}609617", "rear"), (r"^[0-9A-Z]{3}609527|^[0-9A-Z]{3}698525", "rear"),
    (r"^[0-9A-Z]{3}615121", "front"), (r"^[0-9A-Z]{3}615425", "rear"),
    # BMW / Mini: 34 11 = front, 34 21 = rear
    (r"^3411", "front"), (r"^3421", "rear"), (r"^34326", "front"), (r"^34306", "rear"), (r"^34356", "front"), (r"^34357", "rear"),
    # Mercedes-Benz: x 421 = front disc, x 423 = rear disc, x 420 = front pads
    (r"^A?\d{3}421\d{4}", "front"), (r"^A?\d{3}423\d{4}", "rear"),
    # Toyota / Lexus
    (r"^43512", "front"), (r"^42431", "rear"), (r"^04465", "front"), (r"^04466", "rear"), (r"^47750|^47730", "front"), (r"^47850|^47830", "rear"), (r"^42431", "rear"),
    # Honda / Acura
    (r"^45251", "front"), (r"^42510", "rear"), (r"^45022", "front"), (r"^43022", "rear"),
    # Nissan / Infiniti / Renault (shared numbering)
    (r"^40206|^D0206", "front"), (r"^43206|^D3206", "rear"), (r"^41060|^D1060", "front"), (r"^44060|^D4060", "rear"),
    # Hyundai / Kia
    (r"^51712", "front"), (r"^58411", "rear"), (r"^58101", "front"), (r"^58302", "rear"), (r"^58180|^58190", "front"), (r"^58210|^58230|^58310|^58311", "rear"),
    # Mazda
    (r"^[A-Z0-9]{4}3325", "front"), (r"^[A-Z0-9]{4}26251", "rear"), (r"^[A-Z0-9]{4}3323Z", "front"), (r"^[A-Z0-9]{4}2648Z|^[A-Z0-9]{4}2643Z", "rear"),
    # Subaru
    (r"^26300", "front"), (r"^26700", "rear"), (r"^26296", "front"), (r"^26696", "rear"),
    # PSA (Peugeot / Citroën / DS)
    (r"^4252[A-Z0-9]|^4253[A-Z0-9]", "front"), (r"^4254[A-Z0-9]", "rear"), (r"^4400[A-Z0-9]", "front"), (r"^4401[A-Z0-9]", "rear"),
    # Opel / Vauxhall (GM Europe)
    (r"^5690\d\d", "front"), (r"^5691\d\d", "rear"), (r"^5420\d\d", "front"), (r"^5421\d\d", "rear"),
    # Land Rover / Jaguar
    (r"^SDB.*R$", "rear"), (r"^SDB", "front"), (r"^SFC", "front"), (r"^SDC", "rear"),
]
_COMPILED = [(re.compile(p, re.I), a) for p, a in OE_RULES]


def axle_from_oe(oe_numbers):
    votes = {"front": 0, "rear": 0}
    for raw in oe_numbers or []:
        n = re.sub(r"[\s\-.]", "", raw).upper()
        for rx, axle in _COMPILED:
            if rx.match(n):
                votes[axle] += 1
                break
    if votes["front"] and not votes["rear"]:
        return "front"
    if votes["rear"] and not votes["front"]:
        return "rear"
    return None


def infer_axle(rec):
    """rec: enriched Spareto record with props, oe, kind_hint, axle. Returns (axle, source)."""
    if rec.get("axle"):
        return rec["axle"], "fitting-position"
    props = dict(rec.get("props") or [])
    kind = rec.get("kind_hint")
    if kind in ("drum", "shoes"):
        return "rear", "kind"
    cal = (props.get("Brake Caliper Type") or "").lower()
    if kind == "caliper" and ("parking brake" in cal or "handbrake" in cal):
        return "rear", "kind"
    oe = axle_from_oe(rec.get("oe"))
    if oe:
        return oe, "oe"
    return None, None
