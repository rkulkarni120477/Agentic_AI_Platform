from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.agents.orchestrator import run_workflow
from app.api.schemas import FileRecordResponse, WorkflowRequest, WorkflowResponse
from app.db.models import FileRecord, WorkflowRun
from app.db.session import get_session

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/workflows", response_model=WorkflowResponse)
def create_workflow(request: WorkflowRequest, session: Session = Depends(get_session)) -> WorkflowResponse:
    workflow = WorkflowRun(use_case=request.use_case, status="running")
    session.add(workflow)
    session.commit()
    session.refresh(workflow)

    result = run_workflow(request)
    workflow.status = "completed"
    workflow.result = result.model_dump()
    session.commit()

    return WorkflowResponse(id=workflow.id, status=workflow.status, result=result)


@router.get("/workflows/{workflow_id}", response_model=WorkflowResponse)
def get_workflow(workflow_id: UUID, session: Session = Depends(get_session)) -> WorkflowResponse:
    workflow = session.get(WorkflowRun, workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowResponse(id=workflow.id, status=workflow.status, result=workflow.result)


@router.post("/files", response_model=FileRecordResponse)
async def upload_file(file: UploadFile = File(...), session: Session = Depends(get_session)) -> FileRecordResponse:
    contents = await file.read()
    record = FileRecord(filename=file.filename or "uploaded-file", content_type=file.content_type, size=len(contents))
    session.add(record)
    session.commit()
    session.refresh(record)
    return FileRecordResponse.model_validate(record)
