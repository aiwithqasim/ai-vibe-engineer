"""Apply AI mutation payloads to an in-memory board dict (single save via crud)."""

import uuid
from typing import Any


def apply_all(board: dict[str, Any], mutations: list[dict[str, Any]]) -> None:
    for m in mutations:
        _apply_one(board, m)


def _apply_one(board: dict[str, Any], m: dict[str, Any]) -> None:
    t = m.get("type")
    if t == "create_card":
        _create_card(board, m)
    elif t == "move_card":
        _move_card(board, m)
    elif t == "delete_card":
        _delete_card(board, m)
    elif t == "rename_column":
        _rename_column(board, m)
    else:
        raise ValueError(f"unknown mutation type: {t}")


def _rename_column(board: dict[str, Any], m: dict[str, Any]) -> None:
    column_id = m["column_id"]
    title = m["title"]
    for col in board["columns"]:
        if col["id"] == column_id:
            col["title"] = title
            return
    raise ValueError("column not found")


def _create_card(board: dict[str, Any], m: dict[str, Any]) -> None:
    column_id = m["column_id"]
    title = m["title"]
    details = (m.get("details") or "").strip() or "No details yet."
    target = next((c for c in board["columns"] if c["id"] == column_id), None)
    if target is None:
        raise ValueError("column not found")
    cid = f"card-{uuid.uuid4().hex[:12]}"
    board["cards"][cid] = {"id": cid, "title": title, "details": details}
    target["cardIds"] = [*target["cardIds"], cid]


def _delete_card(board: dict[str, Any], m: dict[str, Any]) -> None:
    card_id = m["card_id"]
    if card_id not in board["cards"]:
        raise ValueError("card not found")
    del board["cards"][card_id]
    for col in board["columns"]:
        col["cardIds"] = [x for x in col["cardIds"] if x != card_id]


def _move_card(board: dict[str, Any], m: dict[str, Any]) -> None:
    card_id = m["card_id"]
    target_column_id = m["target_column_id"]
    position = int(m["position"])
    if card_id not in board["cards"]:
        raise ValueError("card not found")
    for col in board["columns"]:
        col["cardIds"] = [x for x in col["cardIds"] if x != card_id]
    target = next((c for c in board["columns"] if c["id"] == target_column_id), None)
    if target is None:
        raise ValueError("column not found")
    pos = max(0, min(position, len(target["cardIds"])))
    target["cardIds"].insert(pos, card_id)
