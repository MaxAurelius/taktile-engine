from ..schemas import Node, Transaction
from ..services import FeatureStore, ModelLoader
import pandas as pd
from datetime import datetime
from typing import Tuple, Dict, Any

def spending_deviation(node: Node, transaction: Transaction, **kwargs) -> Tuple[None, dict]:
    """Calculates the spending deviation and attaches it to the transaction features."""
    customer_features = FeatureStore.get_latest_features(transaction.id)
    avg_amount = customer_features.get('CUSTOMER_ID_AVG_AMOUNT_30D', 0)
    std_amount = customer_features.get('CUSTOMER_ID_STD_AMOUNT_30D', 0)
    
    if std_amount > 0:
        z_score = (transaction.amount - avg_amount) / std_amount
    else:
        z_score = 0.0
        
    transaction.features['spending_deviation'] = z_score
    output_data = {"Z-Score": f"{z_score:.4f}"}
    return None, output_data

def velocity_counter_24h(node: Node, transaction: Transaction, **kwargs) -> Tuple[None, dict]:
    """Retrieves the 24h transaction count and attaches it to the transaction features."""
    customer_features = FeatureStore.get_latest_features(transaction.id)
    velocity = customer_features.get('CUSTOMER_ID_NB_TX_24H', 0)
    
    transaction.features['velocity_24h'] = velocity
    output_data = {"TX Count (24h)": f"{velocity}"}
    return None, output_data

def terminal_risk_score(node: Node, transaction: Transaction, **kwargs) -> Tuple[None, dict]:
    """Retrieves the terminal's historical risk and attaches it to the transaction features."""
    customer_features = FeatureStore.get_latest_features(transaction.id)
    risk = customer_features.get('TERMINAL_ID_RISK_30D', 0)

    transaction.features['terminal_risk'] = risk
    output_data = {"Terminal Risk": f"{risk:.4f}"}
    return None, output_data

def xgboost_model(node: Node, transaction: Transaction, **kwargs) -> Tuple[None, dict]:
    """
    Runs the XGBoost model by synthesizing features from the transaction object
    and falling back to the feature store for historical data.
    """
    model = ModelLoader.get_model()
    
    # Start with historical features from the store
    features = FeatureStore.get_latest_features(customer_id=transaction.id)

    # Add real-time transaction data
    features['TX_AMOUNT'] = transaction.amount
    now = datetime.now()
    features['TX_DURING_WEEKEND'] = int(now.weekday() >= 5)
    features['HourOfDay'] = now.hour

    # This list reflects the true state of the model's training data
    expected_features = [
        'TX_AMOUNT', 'TX_DURING_WEEKEND', 'HourOfDay',
        'CUSTOMER_ID_NB_TX_1H', 'CUSTOMER_ID_NB_TX_24H', 'CUSTOMER_ID_NB_TX_7D',
        'CUSTOMER_ID_AMOUNT_ZSCORE_30D', 'CUSTOMER_ID_TIME_SINCE_LAST_TX',
        'TERMINAL_ID_RISK_30D', 'CUSTOMER_ID_TERMINAL_ID_NB_TX_30D'
    ]
    
    # OVERWRITE with values calculated from connected feature nodes
    if 'spending_deviation' in transaction.features:
        features['CUSTOMER_ID_AMOUNT_ZSCORE_30D'] = transaction.features['spending_deviation']
    if 'velocity_24h' in transaction.features:
        features['CUSTOMER_ID_NB_TX_24H'] = transaction.features['velocity_24h']
    if 'terminal_risk' in transaction.features:
        features['TERMINAL_ID_RISK_30D'] = transaction.features['terminal_risk']
        
    # Create a DataFrame, filling any missing values with 0
    input_df = pd.DataFrame([features], columns=expected_features).fillna(0)
    
    # Predict and attach the score to the transaction object for subsequent nodes.
    score = model.predict_proba(input_df)[0][1]
    transaction.model_score = score

    output_data = {"Predicted Fraud Score": f"{score:.4f}"}
    return None, output_data