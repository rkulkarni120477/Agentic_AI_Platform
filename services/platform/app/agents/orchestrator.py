from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from app.agents.domain_agents import DOMAIN_AGENTS
from app.api.schemas import AgentResult, WorkflowRequest, WorkflowResult


class WorkflowState(TypedDict):
    prompt: str
    selected_agents: list[str]
    parameters: dict[str, Any]
    results: list[AgentResult]


def normalize_agent_names(agent_names: list[str]) -> list[str]:
    if not agent_names:
        return list(DOMAIN_AGENTS.keys())

    normalized: list[str] = []
    for name in agent_names:
        key = name.strip().lower().replace("&", "and").replace(" ", "-")
        candidate = next((agent_key for agent_key in DOMAIN_AGENTS if agent_key == key), None)
        if candidate is not None:
            normalized.append(candidate)
            continue

        friendly_key = next(
            (
                agent_key
                for agent_key in DOMAIN_AGENTS
                if agent_key.replace("-", " ").lower() == name.strip().lower()
                or agent_key.replace("-", " ").lower() == name.strip().lower().replace("and", "&")
            ),
            None,
        )
        if friendly_key is not None:
            normalized.append(friendly_key)

    return list(dict.fromkeys(normalized)) or list(DOMAIN_AGENTS.keys())


def select_agents(state: WorkflowState) -> WorkflowState:
    state["selected_agents"] = normalize_agent_names(state["selected_agents"])
    return state


def invoke_domain_agents(state: WorkflowState) -> WorkflowState:
    state["results"] = [DOMAIN_AGENTS[name].invoke(state) for name in state["selected_agents"] if name in DOMAIN_AGENTS]
    return state


def summarize(state: WorkflowState) -> WorkflowState:
    completed = ", ".join(result.agent for result in state["results"])
    state["parameters"]["summary"] = f"Completed orchestration across: {completed}"
    return state


def build_graph():
    graph = StateGraph(WorkflowState)
    graph.add_node("select_agents", select_agents)
    graph.add_node("invoke_domain_agents", invoke_domain_agents)
    graph.add_node("summarize", summarize)
    graph.set_entry_point("select_agents")
    graph.add_edge("select_agents", "invoke_domain_agents")
    graph.add_edge("invoke_domain_agents", "summarize")
    graph.add_edge("summarize", END)
    return graph.compile()


def run_workflow(request: WorkflowRequest) -> WorkflowResult:
    graph = build_graph()
    state = graph.invoke(
        {
            "prompt": request.prompt,
            "selected_agents": request.selected_agents,
            "parameters": request.parameters,
            "results": [],
        }
    )
    return WorkflowResult(
        summary=state["parameters"].get("summary", "Workflow completed"),
        agent_results=state["results"],
        recommendations=["Route completed artifacts to human approval before publishing."],
    )
