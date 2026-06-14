"""
Seed runner — reads data from seeds/, downloads covers, and populates the API.
Usage (from api/ with venv active):
    python seed.py
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"
SEEDS_DIR = os.path.join(os.path.dirname(__file__), "seeds")
COVERS_DIR = os.path.join(os.path.dirname(__file__), "uploads", "covers")


def _api(path: str, body: dict, token: str | None = None, method: str = "POST") -> tuple[int, dict]:
    data = json.dumps(body).encode()
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        body_bytes = e.read()
        try:
            return e.code, json.loads(body_bytes)
        except Exception:
            return e.code, {"detail": body_bytes.decode(errors="replace")}


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9-]", "", name.lower().replace(" ", "-"))


def _download_cover(src_url: str, filename: str) -> str | None:
    os.makedirs(COVERS_DIR, exist_ok=True)
    dest = os.path.join(COVERS_DIR, filename)
    if os.path.exists(dest):
        return f"/static/covers/{filename}"
    try:
        urllib.request.urlretrieve(src_url, dest)
        return f"/static/covers/{filename}"
    except Exception as e:
        print(f"    ! cover download failed: {e}")
        return None


def _load(filename: str) -> list[dict]:
    with open(os.path.join(SEEDS_DIR, filename), encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    username = input("Username: ").strip()
    password = input("Password: ").strip()

    status, body = _api("/auth/login", {"username": username, "password": password})
    if status != 200:
        print(f"Login failed: {body}")
        sys.exit(1)
    token = body["access_token"]
    print(f"Logged in as {username}\n")

    # ── Categories ──────────────────────────────────────────────────────────
    print("Seeding categories…")
    for cat in _load("categories.json"):
        code, resp = _api("/categories", cat, token)
        if code == 201:
            print(f"  +  {cat['name']}")
        else:
            print(f"  =  {cat['name']} (skipped — {resp.get('detail', code)})")

    # ── Books ────────────────────────────────────────────────────────────────
    print("\nSeeding books…")
    for book in _load("books.json"):
        filename = _slug(book["title"]) + ".jpg"
        cover_url = _download_cover(book.pop("cover_src"), filename)
        payload = {**book, "cover_url": cover_url}
        code, resp = _api("/books", payload, token)
        cover_tag = "cover ok" if cover_url else "no cover"
        if code == 201:
            print(f"  +  {book['title']} ({cover_tag})")
        else:
            print(f"  !  {book['title']} — {resp}")

    print("\nDone.")


if __name__ == "__main__":
    main()
