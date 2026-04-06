import os
from pathlib import Path

_db = Path(__file__).resolve().parent / ".pytest_kanban.db"
os.environ["DATABASE_PATH"] = str(_db)
if _db.exists():
    _db.unlink()

import pytest
from fastapi.testclient import TestClient
from backend.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def reset_board_each_test(client):
    from backend import database

    database.reset_board_to_seed()
    yield
