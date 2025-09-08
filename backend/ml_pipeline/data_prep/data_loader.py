import pandas as pd
import os
import logging
from datetime import datetime, timedelta

# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_and_consolidate_data(raw_data_path: str, output_path: str, days_to_load: int):
    """
    Loads daily pickle files, consolidates them into a single DataFrame,
    and saves it as a Parquet file.

    Args:
        raw_data_path (str): Path to the directory with daily .pkl files.
        output_path (str): Path to save the consolidated Parquet file.
        days_to_load (int): The number of days of data to load and consolidate.
    """
    logging.info(f"Starting data consolidation for {days_to_load} days.")

    daily_files = sorted([f for f in os.listdir(raw_data_path) if f.endswith('.pkl')])

    if not daily_files:
        logging.error("No .pkl files found in the specified directory.")
        return

    df_list = []
    files_to_process = daily_files[:days_to_load]

    for file_name in files_to_process:
        file_path = os.path.join(raw_data_path, file_name)
        try:
            daily_df = pd.read_pickle(file_path)
            df_list.append(daily_df)
        except Exception as e:
            logging.error(f"Could not read file {file_name}: {e}")

    if not df_list:
        logging.error("No dataframes were loaded. Aborting.")
        return

    consolidated_df = pd.concat(df_list, ignore_index=True)
    logging.info(f"Consolidated {len(df_list)} files into a DataFrame with {len(consolidated_df)} rows.")

    consolidated_df.to_parquet(output_path, index=False)
    logging.info(f"Consolidated data saved to {output_path}")

if __name__ == "__main__":
    RAW_DATA_PATH = '../../simulated-data-raw/'
    CONSOLIDATED_DATA_PATH = '../../data/consolidated_transactions.parquet'
    DAYS_TO_PROCESS = 30 

    load_and_consolidate_data(RAW_DATA_PATH, CONSOLIDATED_DATA_PATH, DAYS_TO_PROCESS)