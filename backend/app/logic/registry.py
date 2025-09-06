from ._rules import amount_gate, threshold_gate, and_gate, or_gate
from ._features_and_models import (
    spending_deviation, 
    xgboost_model,
    velocity_counter_24h,
    terminal_risk_score
)

NODE_LOGIC_REGISTRY = {
    # Rules
    "Amount Gate": amount_gate,
    "Threshold Gate": threshold_gate,
    "AND Gate": and_gate,
    "OR Gate": or_gate,

    # --- UPDATED: REGISTER ALL FEATURE NODES ---
    "Spending Deviation": spending_deviation,
    "Velocity Counter (24h)": velocity_counter_24h,
    "Terminal Risk Score": terminal_risk_score,

    # Models
    "XGBoost Model": xgboost_model, 
}