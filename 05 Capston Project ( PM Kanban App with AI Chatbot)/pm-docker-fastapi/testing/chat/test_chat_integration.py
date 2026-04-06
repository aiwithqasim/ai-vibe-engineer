"""
Placeholder for full AI chat stack tests against Docker + OpenRouter.

Run manually when Parts 9–10 are exercised end-to-end:

  pytest testing/chat/test_chat_integration.py

Add cases that call POST /api/chat with a live key, or extend Playwright flows.
"""

import pytest

pytestmark = pytest.mark.skip(reason="Define integration scenarios when needed")


def test_placeholder():
    assert True
