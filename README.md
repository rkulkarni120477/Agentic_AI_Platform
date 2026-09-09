# Academian Agentic AI Platform

This repository is a starter implementation for the platform shown in the supplied architecture diagrams. It intentionally excludes AWS infrastructure and uses a local-first stack:

- React / Next.js client for workflow authoring, document upload, monitoring, and user-facing operations.
- FastAPI platform API for client integration.
- LangGraph orchestration for multi-agent workflow routing.
- LangChain-ready Python domain agents for content studio, workforce skills, skills and standards intelligence, accessibility remediation, and knowledge intelligence.
- SQLite as the local operational database.
- Docker Compose for local platform and web containers.

## Run Locally

```powershell
docker compose up --build
```

Then open:

- Web client: http://localhost:3000
- Platform API docs: http://localhost:8000/docs

## Backend Development

```powershell
Set-Location services/platform
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

## Frontend Development

```powershell
Set-Location apps/web
npm install
npm run dev
```

## Architecture Notes

See [docs/architecture-review.md](docs/architecture-review.md) for the diagram review, component mapping, MVP scope, and implementation backlog.
