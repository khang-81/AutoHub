#!/usr/bin/env python3
"""Smoke test các luồng quan trọng: KYC pending, trả xe 2 bước, sửa xe thuê."""
import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import urllib.error
import urllib.request
from datetime import date, timedelta

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8088").rstrip("/")
ADMIN_EMAIL = os.environ.get("TEST_ADMIN", "admin@autohub.id.vn")
USER_EMAIL = os.environ.get("TEST_USER", "user@autohub.id.vn")
PASSWORD = os.environ.get("TEST_PASSWORD", "admin123@")


def req(method: str, path: str, token: str | None = None, body: dict | None = None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as res:
            raw = res.read().decode()
            return res.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            payload = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            payload = {"message": raw}
        return e.code, payload


def user_id(token: str) -> int:
    code, profile = req("GET", "/api/users/getProfile", token=token)
    if code != 200 or not profile.get("id"):
        raise AssertionError(f"getProfile failed: {code} {profile}")
    return int(profile["id"])


def gallery_payload(detail: dict, rent_car: dict) -> list[dict]:
    existing = detail.get("images") or rent_car.get("images") or []
    ext = [i for i in existing if (i.get("imageType") or "").upper() == "EXTERIOR"]
    intr = [i for i in existing if (i.get("imageType") or "").upper() == "INTERIOR"]
    fallback = (
        (ext[0].get("imageUrl") if ext else None)
        or (intr[0].get("imageUrl") if intr else None)
        or detail.get("imagePath")
        or rent_car.get("imagePath")
        or "https://example.com/car.jpg"
    )
    while len(ext) < 3:
        ext.append({"imageUrl": fallback, "imageType": "EXTERIOR", "sortOrder": len(ext) + 1})
    while len(intr) < 2:
        intr.append({"imageUrl": fallback, "imageType": "INTERIOR", "sortOrder": len(intr) + 1})
    return [
        *[{**i, "imageType": "EXTERIOR", "sortOrder": n} for n, i in enumerate(ext[:3], 1)],
        *[{**i, "imageType": "INTERIOR", "sortOrder": n} for n, i in enumerate(intr[:2], 1)],
    ]


def login(email: str, portal: str) -> str:
    code, data = req(
        "POST",
        "/api/auth/login",
        body={"email": email, "password": PASSWORD, "portal": portal},
    )
    if code != 200 or not data.get("success"):
        raise AssertionError(f"login {email} ({portal}) failed: {code} {data}")
    lr = data.get("loginResponse") or data.get("data") or {}
    token = lr.get("token")
    if not token:
        raise AssertionError(f"no token in login response: {data}")
    return token


def ensure_confirmed_rental(
    user_tok: str, admin_tok: str, car_id: int, uid: int
) -> tuple[dict | None, str | None]:
    code, my_rentals = req("GET", "/api/rentals/getRentalsByUserId", token=user_tok)
    if code == 200 and isinstance(my_rentals, list):
        row = next(
            (
                r
                for r in my_rentals
                if (r.get("rentalStatus") or "") == "CONFIRMED" and not r.get("returnDate")
            ),
            None,
        )
        if row:
            return row, None

    today = date.today()
    code, created = req(
        "POST",
        "/api/rentals/add",
        token=user_tok,
        body={
            "startDate": today.isoformat(),
            "endDate": (today + timedelta(days=2)).isoformat(),
            "carId": car_id,
            "userId": uid,
            "paymentMethod": "CASH",
        },
    )
    if code != 200 or not created.get("id"):
        return None, f"rental add -> {code} {created}"
    rid = created["id"]
    code, confirm = req("PUT", f"/api/rentals/confirm/{rid}", token=admin_tok)
    if code != 200 or not confirm.get("success", True):
        return None, f"admin confirm -> {code} {confirm}"
    code, my_rentals2 = req("GET", "/api/rentals/getRentalsByUserId", token=user_tok)
    if code == 200 and isinstance(my_rentals2, list):
        row = next((r for r in my_rentals2 if r.get("id") == rid), None)
        return row, None
    return {"id": rid}, None


def main() -> int:
    fails = []
    notes = []

    code, _ = req("GET", "/actuator/health/liveness")
    if code != 200:
        fails.append(f"health liveness -> {code}")

    admin_tok = login(ADMIN_EMAIL, "ADMIN")
    user_tok = login(USER_EMAIL, "USER")
    uid = user_id(user_tok)

    code, docs = req("GET", "/api/kyc/my", token=user_tok)
    if code == 200 and isinstance(docs, list):
        pending = [d for d in docs if (d.get("status") or "").upper() == "PENDING"]
        approved = [d for d in docs if (d.get("status") or "").upper() == "APPROVED"]
        if pending:
            notes.append(f"KYC: {len(pending)} doc(s) PENDING (auto-approve off — expected)")
        elif approved:
            notes.append(f"KYC: demo user has {len(approved)} approved doc(s) (seeded OK)")
    else:
        fails.append(f"kyc my -> {code}")

    code, cars = req("GET", "/api/cars/getAll")
    rent_car = next(
        (c for c in (cars if isinstance(cars, list) else []) if c.get("listingType") == "RENT_ONLY"),
        None,
    )
    if rent_car:
        cid = rent_car["id"]
        code, detail = req("GET", f"/api/cars/getById/{cid}")
        if code == 200:
            payload = {
                "id": cid,
                "plate": detail.get("plate") or rent_car.get("plate"),
                "modelYear": detail.get("modelYear") or rent_car.get("modelYear"),
                "kilometer": detail.get("kilometer") or rent_car.get("kilometer") or 0,
                "dailyPrice": detail.get("dailyPrice") or rent_car.get("dailyPrice") or 500000,
                "listingType": "RENT_ONLY",
                "modelId": detail.get("model", {}).get("id") or rent_car.get("model", {}).get("id"),
                "colorId": detail.get("color", {}).get("id") or rent_car.get("color", {}).get("id"),
                "minFindeksRate": detail.get("minFindeksRate") or 500,
                "imagePath": detail.get("imagePath") or rent_car.get("imagePath") or "",
                "images": gallery_payload(detail, rent_car),
            }
            code, res = req("PUT", "/api/cars/update", token=admin_tok, body=payload)
            if code != 200 or not res.get("success", True):
                fails.append(f"update rent car without salePrice -> {code} {res}")
        else:
            fails.append(f"getById car -> {code}")
    else:
        fails.append("no RENT_ONLY car in catalog")

    rental_err = None
    confirmed = None
    if rent_car:
        confirmed, rental_err = ensure_confirmed_rental(user_tok, admin_tok, rent_car["id"], uid)
    if confirmed:
        rid = confirmed["id"]
        start_km = confirmed.get("startKilometer") or confirmed.get("car", {}).get("kilometer") or 0
        code, res = req(
            "PUT",
            f"/api/rentals/{rid}/return",
            token=user_tok,
            body={"endKilometer": start_km + 50, "additionalIncidentalFees": 0},
        )
        if code != 200 or not res.get("success", True):
            fails.append(f"user return request -> {code} {res}")
        else:
            code_cancel, cancel_res = req(
                "PUT",
                f"/api/rentals/cancel/{rid}",
                token=user_tok,
                body={"reason": "test cancel while pending return"},
            )
            if code_cancel == 200 and cancel_res.get("success", False):
                fails.append("cancel should fail when PENDING_RETURN")
            elif code_cancel != 400:
                fails.append(f"cancel PENDING_RETURN expected 400, got {code_cancel} {cancel_res}")

            code2, rentals_admin = req("GET", "/api/rentals/getAll", token=admin_tok)
            row = next(
                (r for r in (rentals_admin if isinstance(rentals_admin, list) else []) if r["id"] == rid),
                None,
            )
            if not row or row.get("rentalStatus") != "PENDING_RETURN":
                fails.append(f"expected PENDING_RETURN after user return, got {row}")
            elif row.get("returnDate"):
                fails.append("returnDate set before admin confirm")
            else:
                code3, res3 = req(
                    "PUT",
                    f"/api/rentals/admin/{rid}/return",
                    token=admin_tok,
                    body={
                        "endKilometer": start_km + 50,
                        "actualFuelLevel": 100,
                        "additionalIncidentalFees": 0,
                    },
                )
                if code3 != 200 or not res3.get("success", True):
                    fails.append(f"admin confirm return -> {code3} {res3}")
                else:
                    code4, rentals_admin2 = req("GET", "/api/rentals/getAll", token=admin_tok)
                    row2 = next(
                        (
                            r
                            for r in (rentals_admin2 if isinstance(rentals_admin2, list) else [])
                            if r["id"] == rid
                        ),
                        None,
                    )
                    if not row2 or row2.get("rentalStatus") != "COMPLETED" or not row2.get("returnDate"):
                        fails.append(f"expected COMPLETED after admin return, got {row2}")
    else:
        fails.append(rental_err or "could not create/find CONFIRMED rental for return flow test")

    if notes:
        print("NOTES:")
        for n in notes:
            print(" -", n)
    if fails:
        print("FAILED:")
        for f in fails:
            print(" -", f)
        return 1
    print("OK — all executed checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
