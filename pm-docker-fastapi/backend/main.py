from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()


@app.get("/api/hello")
def hello():
    return {"message": "hello world"}


# Serve static frontend — mounted last so API routes take priority.
# Falls back to a minimal HTML response if the built frontend is not present.
_static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(_static_dir):
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
