from typing import Any, Protocol

from app.api.schemas import AgentResult


class DomainAgent(Protocol):
    name: str

    def invoke(self, state: dict[str, Any]) -> AgentResult:
        ...
