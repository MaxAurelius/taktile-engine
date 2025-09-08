import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import logging
import time

# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def train_model(feature_store_path: str, model_output_path: str):
    """
    Trains an Isolation Forest model and saves it.
    """
    start_time = time.time()
    logging.info("Starting model training...")

    df = pd.read_parquet(feature_store_path)
    df['TX_DATETIME'] = pd.to_datetime(df['TX_DATETIME'])

    # --- 1. Define Feature Set and Target ---
    features = [
        'TX_AMOUNT', 'TX_DURING_WEEKEND', 'HourOfDay',
        'CUSTOMER_ID_NB_TX_1H', 'CUSTOMER_ID_NB_TX_24H', 'CUSTOMER_ID_NB_TX_7D',
        'CUSTOMER_ID_AMOUNT_ZSCORE_30D', 'CUSTOMER_ID_TIME_SINCE_LAST_TX',
        'TERMINAL_ID_RISK_30D', 'CUSTOMER_ID_TERMINAL_ID_NB_TX_30D'
    ]
    target = 'TX_FRAUD'

    # --- 2. Temporal Train/Test Split ---
    split_date = df['TX_DATETIME'].min() + pd.Timedelta(days=21)
    train_df = df[df['TX_DATETIME'] < split_date]
    
    X_train = train_df[features]
    logging.info(f"Training data prepared. Shape: {X_train.shape}")

    # --- 3. Train the Isolation Forest Model ---
    model = IsolationForest(n_estimators=100,
                            contamination='auto', # Let the model estimate the fraud rate
                            random_state=42,
                            n_jobs=-1) # Use all available CPU cores
    
    logging.info("Training Isolation Forest model...")
    model.fit(X_train)
    logging.info("Model training complete.")

    # --- 4. Save the Model Artifact ---
    joblib.dump(model, model_output_path)
    logging.info(f"Model saved to {model_output_path}")
    
    execution_time = time.time() - start_time
    logging.info(f"Total training time: {execution_time:.2f} seconds")

if __name__ == "__main__":
    FEATURE_STORE_PATH = '../../data/feature_store.parquet'
    MODEL_OUTPUT_PATH = '../../models/isolation_forest_v1.joblib'
    
    train_model(FEATURE_STORE_PATH, MODEL_OUTPUT_PATH)