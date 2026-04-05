import copy
import uuid

from backend import board_mutations, database


def _board() -> dict:
    return copy.deepcopy(database.load_board())


def _save(board: dict) -> None:
    database.save_board(board)


def update_column_title(column_id: str, title: str) -> dict:
    board = _board()
    found = False
    for col in board["columns"]:
        if col["id"] == column_id:
            col["title"] = title
            found = True
            break
    if not found:
        raise ValueError("column not found")
    _save(board)
    return board


def create_card(column_id: str, title: str, details: str) -> dict:
    board = _board()
    target = next((c for c in board["columns"] if c["id"] == column_id), None)
    if target is None:
        raise ValueError("column not found")
    cid = f"card-{uuid.uuid4().hex[:12]}"
    text = (details or "").strip() or "No details yet."
    board["cards"][cid] = {"id": cid, "title": title, "details": text}
    target["cardIds"] = [*target["cardIds"], cid]
    _save(board)
    return board


def patch_card(
    card_id: str,
    *,
    title: str | None = None,
    details: str | None = None,
    column_id: str | None = None,
    index: int | None = None,
) -> dict:
    board = _board()
    if card_id not in board["cards"]:
        raise ValueError("card not found")

    if title is not None:
        board["cards"][card_id]["title"] = title
    if details is not None:
        board["cards"][card_id]["details"] = details

    if column_id is not None:
        for col in board["columns"]:
            col["cardIds"] = [x for x in col["cardIds"] if x != card_id]
        target = next((c for c in board["columns"] if c["id"] == column_id), None)
        if target is None:
            raise ValueError("column not found")
        pos = index if index is not None else len(target["cardIds"])
        pos = max(0, min(pos, len(target["cardIds"])))
        target["cardIds"].insert(pos, card_id)
    elif index is not None:
        col = next((c for c in board["columns"] if card_id in c["cardIds"]), None)
        if col is None:
            raise ValueError("card not in board")
        ids = [x for x in col["cardIds"] if x != card_id]
        pos = max(0, min(index, len(ids)))
        ids.insert(pos, card_id)
        col["cardIds"] = ids

    _save(board)
    return board


def delete_card(card_id: str) -> dict:
    board = _board()
    if card_id not in board["cards"]:
        raise ValueError("card not found")
    del board["cards"][card_id]
    for col in board["columns"]:
        col["cardIds"] = [x for x in col["cardIds"] if x != card_id]
    _save(board)
    return board


def replace_board(payload: dict) -> None:
    database.save_board(payload)


def apply_ai_mutations_from_payloads(mutations: list[dict]) -> dict:
    board = _board()
    board_mutations.apply_all(board, mutations)
    _save(board)
    return board
