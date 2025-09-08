import pandas as pd
import xgboost as xgb
import joblib
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def train_xgb_model(feature_store_path: str, model_output_path: str):
    logging.info("Starting XGBoost model training...")
    df = pd.read_parquet(feature_store_path)
    df['TX_DATETIME'] = pd.to_datetime(df['TX_DATETIME'])

    features = [
        'TX_AMOUNT', 'TX_DURING_WEEKEND', 'HourOfDay',
        'CUSTOMER_ID_NB_TX_1H', 'CUSTOMER_ID_NB_TX_24H', 'CUSTOMER_ID_NB_TX_7D',
        'CUSTOMER_ID_AMOUNT_ZSCORE_30D', 'CUSTOMER_ID_TIME_SINCE_LAST_TX',
        'TERMINAL_ID_RISK_30D', 'CUSTOMER_ID_TERMINAL_ID_NB_TX_30D'
    ]
    target = 'TX_FRAUD'

    
    split_date = df['TX_DATETIME'].min() + pd.Timedelta(days=21)
    train_df = df[df['TX_DATETIME'] < split_date]

    X_train = train_df[features]
    y_train = train_df[target]

    # XGBoost is great with class imbalance if we use scale_pos_weight
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

    model = xgb.XGBClassifier(
        objective='binary:logistic',
        eval_metric='aucpr',
        n_estimators=200,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        n_jobs=-1
    )

    logging.info("Training XGBoost model...")
    model.fit(X_train, y_train)
    logging.info("Model training complete.")

    joblib.dump(model, model_output_path)
    logging.info(f"Model saved to {model_output_path}")

if __name__ == "__main__":
    FEATURE_STORE_PATH = '../../data/feature_store.parquet'
    MODEL_OUTPUT_PATH = '../../models/xgboost_v1.joblib'
    train_xgb_model(FEATURE_STORE_PATH, MODEL_OUTPUT_PATH)