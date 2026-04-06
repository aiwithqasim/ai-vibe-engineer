import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend import crud, database
from backend.ai import call_openrouter
from backend.auth import (
    ACCESS_DAYS,
    COOKIE_NAME,
    MVP_PASSWORD,
    MVP_USERNAME,
    create_access_token,
    decode_username,
    require_user,
)
from backend.routers.chat import router as chat_router
from backend.models import (
    BoardPayload,
    ColumnTitleUpdate,
    CreateCardBody,
    PatchCardBody,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(chat_router)


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
def me(_username: Annotated[str, Depends(require_user)]):
    return {"username": _username}


@app.post("/api/ai/test")
def ai_test(_username: Annotated[str, Depends(require_user)]):
    try:
        answer = call_openrouter(
            [
                {
                    "role": "user",
                    "content": 'Reply with only the digit answer, no words: What is 2+2?',
                },
            ],
            json_mode=False,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail="OpenRouter request failed: " + str(e),
        ) from e
    return {"answer": answer}


@app.get("/api/board")
def get_board(_username: Annotated[str, Depends(require_user)]):
    return database.load_board()


@app.put("/api/board")
def put_board(_username: Annotated[str, Depends(require_user)], body: BoardPayload):
    crud.replace_board(body.model_dump())
    return {"ok": True}


def _board_err(exc: Exception) -> HTTPException:
    msg = str(exc)
    if "not found" in msg or "not in board" in msg:
        return HTTPException(status_code=404, detail=msg)
    return HTTPException(status_code=400, detail=msg)


@app.patch("/api/columns/{column_id}")
def patch_column(
    column_id: str,
    _username: Annotated[str, Depends(require_user)],
    body: ColumnTitleUpdate,
):
    try:
        board = crud.update_column_title(column_id, body.title)
    except ValueError as e:
        raise _board_err(e) from e
    return {"board": board}


@app.post("/api/cards")
def post_card(_username: Annotated[str, Depends(require_user)], body: CreateCardBody):
    try:
        board = crud.create_card(body.column_id, body.title, body.details)
    except ValueError as e:
        raise _board_err(e) from e
    return {"board": board}


@app.patch("/api/cards/{card_id}")
def patch_card_route(
    card_id: str,
    _username: Annotated[str, Depends(require_user)],
    body: PatchCardBody,
):
    try:
        board = crud.patch_card(
            card_id,
            title=body.title,
            details=body.details,
            column_id=body.column_id,
            index=body.index,
        )
    except ValueError as e:
        raise _board_err(e) from e
    return {"board": board}


@app.delete("/api/cards/{card_id}")
def delete_card_route(card_id: str, _username: Annotated[str, Depends(require_user)]):
    try:
        board = crud.delete_card(card_id)
    except ValueError as e:
        raise _board_err(e) from e
    return {"board": board}


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
