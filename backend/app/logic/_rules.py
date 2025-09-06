from ..schemas import Node, Transaction
from typing import Tuple, Dict, Any

def amount_gate(node: Node, transaction: Transaction) -> Tuple[str, dict]:
    threshold = node.data.get('value', 0)
    result = transaction.amount >= threshold
    
    output_data = {
        "Transaction Amount": f"€{transaction.amount:.2f}",
        "Condition": f"€{transaction.amount:.2f} >= €{threshold:.2f}",
        "Outcome": str(result).upper()
    }
    
    return 'true' if result else 'false', output_data

def threshold_gate(node: Node, transaction: Transaction) -> Tuple[str, dict]:
    threshold = node.data.get('value', 0.5)

    model_score = transaction.model_score if transaction.model_score is not None else 0.0

    result = model_score >= threshold

    output_data = {
        "Model Score": f"{model_score:.4f}",
        "Condition": f"{model_score:.4f} >= {threshold:.2f}",
        "Outcome": str(result).upper()
    }
    
    return 'true' if result else 'false', output_data

def and_gate(node: Node, transaction: Transaction, parent_results: Dict[str, Any]) -> Tuple[str, dict]:
    # An AND gate is TRUE only if all its inputs are TRUE.
    final_result = all(parent_results.values())
    
    output_data = {
        "Inputs": f"{len(parent_results)}",
        "Outcome": str(final_result).upper()
    }
    return 'true' if final_result else 'false', output_data

def or_gate(node: Node, transaction: Transaction, parent_results: Dict[str, Any]) -> Tuple[str, dict]:
    # An OR gate is TRUE if at least one of its inputs is TRUE.
    final_result = any(parent_results.values())
    
    output_data = {
        "Inputs": f"{len(parent_results)}",
        "Outcome": str(final_result).upper()
    }
    return 'true' if final_result else 'false', output_data
