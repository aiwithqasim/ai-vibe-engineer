import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend import crud, database
from backend.ai import call_openrouter, parse_ai_response_json
from backend.auth import require_user
from backend.prompts import CHAT_SYSTEM_PROMPT

router = APIRouter(prefix="/api", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


@router.post("/chat")
def chat_endpoint(
    body: ChatRequest,
    _username: str = Depends(require_user),
):
    try:
        board = database.load_board()
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not load board") from exc

    board_block = f"<board_json>\n{json.dumps(board)}\n</board_json>\n\n{body.message}"
    messages: list[dict[str, str]] = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT},
    ]
    for h in body.history:
        if h.role in ("user", "assistant"):
            messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": board_block})

    try:
        raw = call_openrouter(messages, json_mode=True)
        parsed = parse_ai_response_json(raw)
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured or unavailable: " + str(e),
        ) from e
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail="AI request failed: " + str(e),
        ) from e

    mutations_out: list[dict] = []
    if parsed.mutations:
        for m in parsed.mutations:
            mutations_out.append(m.model_dump(mode="json"))
        try:
            board = crud.apply_ai_mutations_from_payloads(mutations_out)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e

    return {
        "message": parsed.message,
        "mutations_applied": mutations_out,
        "board": board,
    }
