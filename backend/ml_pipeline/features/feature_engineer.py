import pandas as pd
import logging
import time
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def engineer_features(input_path: str, output_path: str):
    start_time = time.time()
    logging.info(f"Starting FINAL feature engineering from {input_path}")
    
    df = pd.read_parquet(input_path)
    df['TX_DATETIME'] = pd.to_datetime(df['TX_DATETIME'])
    df = df.sort_values('TX_DATETIME').reset_index(drop=True)
    logging.info("Data loaded and sorted successfully.")

    # --- 1. Basic Time-Based Features ---
    df['TX_DURING_WEEKEND'] = (df['TX_DATETIME'].dt.weekday >= 5).astype(int)
    df['HourOfDay'] = df['TX_DATETIME'].dt.hour
    
    # --- 2. Customer & Interaction Features---
    all_customer_features = []
    
    # tqdm provides a progress bar for our loop
    for customer_id, customer_df in tqdm(df.groupby('CUSTOMER_ID'), desc="Processing Customers"):
        
        # Sort transactions for the current customer
        customer_df = customer_df.sort_values('TX_DATETIME')
        
        # Use datetime index for rolling calculations
        customer_df.set_index('TX_DATETIME', inplace=True)
        
        # To prevent data leakage, we use .shift(1)
        transactions_shifted = customer_df.shift(1)

        # Customer Velocity
        customer_df['CUSTOMER_ID_NB_TX_1H'] = transactions_shifted.rolling(window='1h').count()['TRANSACTION_ID']
        customer_df['CUSTOMER_ID_NB_TX_24H'] = transactions_shifted.rolling(window='24h').count()['TRANSACTION_ID']
        customer_df['CUSTOMER_ID_NB_TX_7D'] = transactions_shifted.rolling(window='7d').count()['TRANSACTION_ID']

        # Spending Deviation (Z-Score)
        rolling_stats = transactions_shifted['TX_AMOUNT'].rolling(window='30d', min_periods=1).agg(['mean', 'std'])
        customer_df['CUSTOMER_ID_AVG_AMOUNT_30D'] = rolling_stats['mean']
        customer_df['CUSTOMER_ID_STD_AMOUNT_30D'] = rolling_stats['std']
        customer_df['CUSTOMER_ID_AMOUNT_ZSCORE_30D'] = \
            (customer_df['TX_AMOUNT'] - customer_df['CUSTOMER_ID_AVG_AMOUNT_30D']) / (customer_df['CUSTOMER_ID_STD_AMOUNT_30D'] + 1e-6)

        # Behavioral Timing
        customer_df['CUSTOMER_ID_TIME_SINCE_LAST_TX'] = customer_df.index.to_series().diff().dt.total_seconds()
        
        # Customer-Terminal Interaction
        customer_df['CUSTOMER_ID_TERMINAL_ID_NB_TX_30D'] = \
            customer_df.groupby('TERMINAL_ID').shift(1).rolling(window='30d').count()['TRANSACTION_ID']

        all_customer_features.append(customer_df.reset_index())

    # Combine all the processed customer dataframes
    df_features = pd.concat(all_customer_features, ignore_index=True).sort_values('TX_DATETIME')
    logging.info("Engineered customer behavior & interaction features.")

    # --- 3. Terminal Risk Features ---
    terminal_risk = df_features.groupby('TERMINAL_ID').rolling('30d', on='TX_DATETIME')['TX_FRAUD'].mean().reset_index()
    terminal_risk.rename(columns={'TX_FRAUD': 'TERMINAL_ID_RISK_30D'}, inplace=True)
    terminal_risk['VALID_FROM_DATETIME'] = terminal_risk['TX_DATETIME'] + pd.Timedelta(days=7)
    terminal_risk = terminal_risk.sort_values('VALID_FROM_DATETIME')

    df_features = pd.merge_asof(
        left=df_features,
        right=terminal_risk[['TERMINAL_ID', 'VALID_FROM_DATETIME', 'TERMINAL_ID_RISK_30D']],
        left_on='TX_DATETIME',
        right_on='VALID_FROM_DATETIME',
        by='TERMINAL_ID',
        direction='backward'
    )
    logging.info("Engineered terminal risk features.")
    
    # --- Finalizing ---
    df_features.drop(columns=['VALID_FROM_DATETIME'], inplace=True, errors='ignore')
    df_features.fillna(0, inplace=True)
    
    df_features.to_parquet(output_path, index=False)
    
    execution_time = time.time() - start_time
    logging.info(f"Feature engineering complete. Data saved to {output_path}")
    logging.info(f"Total execution time: {execution_time:.2f} seconds")

if __name__ == "__main__":
    CONSOLIDATED_DATA_PATH = '../../../data/consolidated_transactions.parquet'
    FEATURE_STORE_PATH = '../../../data/feature_store.parquet'
    engineer_features(CONSOLIDATED_DATA_PATH, FEATURE_STORE_PATH)