#!/usr/bin/env python3
import json
import sys
import time
import urllib.error
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = "http://127.0.0.1:8088"


def req(method: str, path: str, token: str | None = None, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=30) as res:
            raw = res.read().decode()
            return res.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        return e.code, json.loads(raw) if raw else {}


def main() -> int:
    ts = int(time.time())
    email = f"test.profile.{ts}@autohub.id.vn"
    phone = f"09{ts % 1000000000:09d}"[:10]
    register_body = {
        "fullName": "Nguyễn Văn Test",
        "phone": phone,
        "birthDate": "1998-05-20",
        "email": email,
        "password": "admin123@",
        "roles": ["user"],
    }

    code, reg = req("POST", "/api/auth/register", body=register_body)
    if code not in (200, 201) or not reg.get("success", True):
        print("FAIL register", code, reg)
        return 1

    code, login = req(
        "POST",
        "/api/auth/login",
        body={"email": email, "password": "admin123@", "portal": "USER"},
    )
    if code != 200 or not login.get("success"):
        print("FAIL login", code, login)
        return 1

    token = (login.get("loginResponse") or {}).get("token")
    if not token:
        print("FAIL no token")
        return 1

    code, prof = req("GET", "/api/users/getProfile", token=token)
    if code != 200 or prof.get("fullName") != "Nguyễn Văn Test" or prof.get("phone") != phone:
        print("FAIL profile", code, prof)
        return 1

    code, cust = req("GET", "/api/customers/me", token=token)
    if code != 200:
        print("FAIL customers/me", code, cust)
        return 1
    if cust.get("lastName", "").lower() != "nguyễn":
        print("FAIL lastName", cust)
        return 1
    if "văn test" not in cust.get("firstName", "").lower():
        print("FAIL firstName", cust)
        return 1
    if str(cust.get("birthdate", ""))[:10] != "1998-05-20":
        print("FAIL birthdate", cust)
        return 1

    print("OK register -> profile -> customers/me")
    return 0


if __name__ == "__main__":
    sys.exit(main())
