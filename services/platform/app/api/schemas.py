from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class WorkflowRequest(BaseModel):
    use_case: str = Field(..., examples=["course-content-blueprint"])
    prompt: str
    selected_agents: list[str] = Field(default_factory=list)
    source_file_ids: list[UUID] = Field(default_factory=list)
    parameters: dict[str, Any] = Field(default_factory=dict)


class AgentResult(BaseModel):
    agent: str
    status: str
    output: dict[str, Any]


class WorkflowResult(BaseModel):
    summary: str
    agent_results: list[AgentResult]
    recommendations: list[str]


class WorkflowResponse(BaseModel):
    id: UUID
    status: str
    result: WorkflowResult | dict[str, Any] | None = None


class FileRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    filename: str
    content_type: str | None
    size: int
