import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Cookie, Depends, FastAPI, HTTPException, Response
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend import database
from backend.auth import (
    ACCESS_DAYS,
    COOKIE_NAME,
    MVP_PASSWORD,
    MVP_USERNAME,
    create_access_token,
    decode_username,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield


app = FastAPI(lifespan=lifespan)


def require_user(session: Annotated[str | None, Cookie()] = None) -> str:
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_username(session)
    if username is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return username


@app.get("/api/hello")
def hello():
    return {"message": "hello world"}


class LoginBody(BaseModel):
    username: str
    password: str


@app.post("/api/auth/login")
def login(body: LoginBody, response: Response):
    if body.username != MVP_USERNAME or body.password != MVP_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(body.username)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24 * ACCESS_DAYS,
    )
    return {"ok": True}


@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@app.get("/api/auth/me")
def me(session: Annotated[str | None, Cookie()] = None):
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_username(session)
    if username is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"username": username}


class CardModel(BaseModel):
    id: str
    title: str
    details: str


class ColumnModel(BaseModel):
    id: str
    title: str
    cardIds: list[str]


class BoardPayload(BaseModel):
    columns: list[ColumnModel]
    cards: dict[str, CardModel]


@app.get("/api/board")
def get_board(_username: Annotated[str, Depends(require_user)]):
    return database.load_board()


@app.put("/api/board")
def put_board(_username: Annotated[str, Depends(require_user)], body: BoardPayload):
    database.save_board(body.model_dump())
    return {"ok": True}


# Serve static frontend — mounted last so API routes take priority.
# Falls back to a minimal HTML response if the built frontend is not present.
_static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(_static_dir):
    _login_html = os.path.join(_static_dir, "login.html")

    @app.get("/login")
    @app.get("/login/")
    def login_page():
        # Next static export emits login.html; StaticFiles does not map /login to that file.
        if os.path.isfile(_login_html):
            return FileResponse(_login_html)
        raise HTTPException(status_code=404)

    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
else:
    @app.get("/", response_class=HTMLResponse)
    def index():
        return """<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Kanban Studio</title></head>
<body>
  <h1>Kanban Studio</h1>
  <p>Backend is running. Frontend not yet built.</p>
  <p><a href="/api/hello">GET /api/hello</a></p>
</body>
</html>"""
