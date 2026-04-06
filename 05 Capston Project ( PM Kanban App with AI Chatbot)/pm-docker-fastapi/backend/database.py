import copy
import json
import os
import sqlite3

from backend.board_seed import BOARD_SEED


def _db_path() -> str:
    custom = os.environ.get("DATABASE_PATH")
    if custom:
        return custom
    data_dir = os.environ.get("DATA_DIR", "data")
    return os.path.join(data_dir, "kanban.db")


def init_db() -> None:
    path = _db_path()
    if not path.startswith(":memory:"):
        parent = os.path.dirname(os.path.abspath(path))
        if parent:
            os.makedirs(parent, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS board_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            payload TEXT NOT NULL
        )
        """
    )
    row = conn.execute("SELECT 1 FROM board_state WHERE id = 1").fetchone()
    if row is None:
        conn.execute(
            "INSERT INTO board_state (id, payload) VALUES (1, ?)",
            (json.dumps(BOARD_SEED),),
        )
        conn.commit()
    conn.close()


def load_board() -> dict:
    path = _db_path()
    conn = sqlite3.connect(path)
    row = conn.execute("SELECT payload FROM board_state WHERE id = 1").fetchone()
    conn.close()
    if row is None:
        init_db()
        return load_board()
    return json.loads(row[0])


def save_board(data: dict) -> None:
    path = _db_path()
    conn = sqlite3.connect(path)
    conn.execute(
        "UPDATE board_state SET payload = ? WHERE id = 1",
        (json.dumps(data),),
    )
    conn.commit()
    conn.close()


def reset_board_to_seed() -> None:
    """Test helper: restore row 1 payload to BOARD_SEED."""
    save_board(copy.deepcopy(BOARD_SEED))
