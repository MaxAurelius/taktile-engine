from pydantic import BaseModel, Field
from typing import List, Dict, Any


class Node(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, float]

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: str | None = None

class StrategyBlueprint(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class Transaction(BaseModel):
    id: int
    amount: float
    isFraud: bool
    features: Dict[str, Any] = Field(default_factory=dict)
    model_score: float | None = None

class ExecutionRequest(BaseModel):
    blueprint: StrategyBlueprint
    transaction: Transaction
    node_outputs: Dict[str, Any] = Field(default_factory=dict)


class ExecutionStep(BaseModel):
    nodeId: str
    edgeId: str | None = None

class ExecutionTrace(BaseModel):
    decision: str # 'APPROVE', 'BLOCK', or 'REVIEW'
    path: List[ExecutionStep]
    node_outputs: Dict[str, Any] = Field(default_factory=dict)
    precision : float=0
    recall : float=0

class ProfileData(BaseModel):
    name: str
    customerId: str
    avgTransaction: float
    activityLevel: int
    typicalCategories: List[str]