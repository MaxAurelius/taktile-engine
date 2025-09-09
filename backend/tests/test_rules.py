from app.schemas import Node, Transaction
from app.logic._rules import amount_gate, and_gate

def test_amount_gate_true():
    """Tests if the amount gate correctly returns 'true' when the amount is >= the threshold."""
    mock_node = Node(id="1", type="Rule", data={"value": 100}, position={"x":0, "y":0})
    mock_transaction = Transaction(id=123, amount=150, isFraud=False)

    handle, output_data = amount_gate(mock_node, mock_transaction)

    assert handle == 'true'
    assert output_data["Outcome"] == "TRUE"

def test_amount_gate_false():
    """Tests if the amount gate correctly returns 'false' when the amount is < the threshold."""
    mock_node = Node(id="1", type="Rule", data={"value": 100}, position={"x":0, "y":0})
    mock_transaction = Transaction(id=123, amount=50, isFraud=False)

    handle, output_data = amount_gate(mock_node, mock_transaction)

    assert handle == 'false'
    assert output_data["Outcome"] == "FALSE"

def test_and_gate_true():
    """Tests if the AND gate returns true when all parent results are true."""
    mock_node = Node(id="1", type="Logic", data={}, position={"x":0, "y":0})
    mock_transaction = Transaction(id=123, amount=50, isFraud=False)
    parent_results = {"parent1": True, "parent2": True}

    handle, output_data = and_gate(mock_node, mock_transaction, parent_results)
    
    assert handle == 'true'