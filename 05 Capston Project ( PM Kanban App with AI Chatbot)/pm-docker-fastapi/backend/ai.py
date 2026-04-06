import json
import os
from typing import Annotated, Literal, Union

import httpx
from pydantic import BaseModel, Field

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b:free"


class CreateCardMutation(BaseModel):
    type: Literal["create_card"] = "create_card"
    column_id: str
    title: str
    details: str = ""


class MoveCardMutation(BaseModel):
    type: Literal["move_card"] = "move_card"
    card_id: str
    target_column_id: str
    position: int


class DeleteCardMutation(BaseModel):
    type: Literal["delete_card"] = "delete_card"
    card_id: str


class RenameColumnMutation(BaseModel):
    type: Literal["rename_column"] = "rename_column"
    column_id: str
    title: str


BoardMutation = Annotated[
    Union[
        CreateCardMutation,
        MoveCardMutation,
        DeleteCardMutation,
        RenameColumnMutation,
    ],
    Field(discriminator="type"),
]


class AiResponse(BaseModel):
    message: str
    mutations: list[BoardMutation] | None = None


def _api_key() -> str:
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY is not set")
    return key


def _model_id() -> str:
    return os.environ.get("OPENROUTER_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL


def call_openrouter(
    messages: list[dict[str, str]],
    *,
    json_mode: bool = False,
) -> str:
    """
    Call OpenRouter chat completions. `messages` use OpenAI-style role/content.
    Returns assistant message content (plain text or JSON string if json_mode).
    """
    payload: dict = {
        "model": _model_id(),
        "messages": messages,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {_api_key()}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("OpenRouter returned no choices")
    content = choices[0].get("message", {}).get("content")
    if content is None or content == "":
        raise RuntimeError("OpenRouter returned empty content")
    return content.strip()


def parse_ai_response_json(text: str) -> AiResponse:
    try:
        raw = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"assistant returned invalid JSON: {e}") from e
    return AiResponse.model_validate(raw)
