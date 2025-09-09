import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app 

SAMPLE_BLUEPRINT = {
    "nodes": [
        {"id": "node-1", "type": "strategyNode", "position": {"x": 50, "y": 150}, "data": {"label": "Transaction Stream", "type": "Input"}},
        {"id": "node-5", "type": "ruleNode", "position": {"x": 350, "y": 350}, "data": {"label": "Amount Gate", "type": "Rule", "value": 50}},
        {"id": "node-10", "type": "strategyNode", "position": {"x": 1550, "y": 300}, "data": {"label": "BLOCK", "type": "Action"}}
    ],
    "edges": [
        {"id": "edge-4", "source": "node-1", "target": "node-5"},
        {"id": "edge-12", "source": "node-5", "sourceHandle": "true", "target": "node-10"}
    ]
}

@pytest.mark.anyio
async def test_root():
    """A simple smoke test to ensure the API is running."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Decision Engine is running"}

@pytest.mark.anyio
async def test_execute_strategy_block():
    """Tests a simple strategy that should result in a BLOCK decision."""
    request_payload = {
        "blueprint": SAMPLE_BLUEPRINT,
        "transaction": {"id": 1, "amount": 100.0, "isFraud": True}
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/strategy/execute", json=request_payload)
        
    assert response.status_code == 200
    result = response.json()
    assert result["decision"] == "BLOCK"
    assert "precision" in result
    assert "recall" in result
    assert len(result["path"]) > 0