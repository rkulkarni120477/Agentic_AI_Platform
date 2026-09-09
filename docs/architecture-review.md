# Architecture Review

## Diagram Alignment

The diagrams consistently describe a multi-agent platform with four major planes:

1. UI Application Client: React or Next.js web application for workflow building, agent selection, file upload, configuration, monitoring, user management, and result review.
2. Workflow Orchestration Layer: central Python orchestrator that routes tasks, coordinates agents, applies guardrails, manages human review states, and exposes workflow status through APIs.
3. Domain Agents: AI Content Studio, Workforce Skills, Skills and Standards Intelligence, Accessibility Audit and Remediation, and Knowledge Intelligence.
4. Shared Knowledge Context: centralized ingestion, chunking, metadata, embeddings, retrieval, access control, versioning, and audit trail.

The AWS infrastructure diagram is treated as a cloud deployment option only. It is intentionally excluded from this implementation. The current local platform uses Docker, FastAPI, LangGraph, LangChain-compatible agents, and SQLite.

## Implementation Mapping

| Diagram Component | Local Implementation |
| --- | --- |
| UI Application Client | `apps/web` Next.js application |
| API Gateway / Platform API | `services/platform/app/api` FastAPI routers |
| Workflow Orchestration Layer | `services/platform/app/agents/orchestrator.py` LangGraph graph |
| Domain Agents | `services/platform/app/agents/domain_agents.py` |
| Shared Knowledge Context | SQLite-backed models and future retrieval services under `services/platform/app/db` |
| Files and Documents Upload | `/api/v1/files` endpoint |
| Workflow Builder / Execution | `/api/v1/workflows` endpoint |
| Monitoring and Results | workflow run records in SQLite, exposed through API |

## MVP Scope

The first MVP should deliver one end-to-end course-content workflow:

1. Upload one or more source documents.
2. Create a workflow using a prompt, selected agents, and configuration parameters.
3. Route through knowledge, content, skills, standards, and accessibility agents.
4. Persist workflow status and generated outputs in SQLite.
5. Present status, agent results, recommendations, and a human approval decision in the UI.

## Backlog

- Add authentication and role-based access control.
- Store uploaded files on disk or object storage abstraction instead of metadata only.
- Add document parsing, chunking, embeddings, and retrieval.
- Replace placeholder domain-agent outputs with LangChain model calls and tool use.
- Add workflow state transitions for draft, review, approved, rejected, and published.
- Add audit log tables for content lineage and compliance evidence.
- Add unit and API tests for orchestration, uploads, and workflow retrieval.
