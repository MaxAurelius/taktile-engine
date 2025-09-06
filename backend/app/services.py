import pandas as pd
import joblib
import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)

class ModelLoader:
    """A singleton service to load and provide the ML model."""
    _model: Any = None

    @classmethod
    def load_model(cls, model_path: str):
        """Loads the model from the specified path into memory."""
        if cls._model is None:
            try:
                logger.info(f"Loading model from {model_path}...")
                cls._model = joblib.load(model_path)
                logger.info("Model loaded successfully.")
            except FileNotFoundError:
                logger.error(f"Model file not found at {model_path}. The model will not be available.")
            except Exception as e:
                logger.error(f"An error occurred while loading the model: {e}")
    
    @classmethod
    def get_model(cls) -> Any:
        """Returns the loaded model instance."""
        if cls._model is None:
            raise RuntimeError("Model has not been loaded. Call load_model() on startup.")
        return cls._model

class FeatureStore:
    """A singleton service to load and provide access to historical feature data."""
    _customer_df: pd.DataFrame | None = None
    _full_df: pd.DataFrame | None = None # Holds the complete dataset


    @classmethod
    def load_feature_store(cls, store_path: str):
        """Loads the feature store Parquet file into a pandas DataFrame."""
        if cls._customer_df is None:
            try:
                logger.info(f"Loading feature store from {store_path}...")
                # For efficiency, we only load the columns we need for our features
                df = pd.read_parquet(store_path)
                # We only need the latest aggregated features for each customer for real-time lookup
                cls._customer_df = df.sort_values('TX_DATETIME').drop_duplicates('CUSTOMER_ID', keep='last')
                cls._customer_df.set_index('CUSTOMER_ID', inplace=True)
                logger.info("Feature store loaded successfully.")
            except FileNotFoundError:
                logger.error(f"Feature store file not found at {store_path}.")
            except Exception as e:
                logger.error(f"An error occurred loading the feature store: {e}")

    @classmethod
    def get_spending_deviation(cls, customer_id: int, transaction_amount: float) -> float:
        """Calculates the spending deviation (Z-score) for a transaction."""
        if cls._customer_df is None:
            raise RuntimeError("Feature store has not been loaded.")
        
        try:
            customer_features = cls._customer_df.loc[customer_id]
            avg_amount = customer_features.get('CUSTOMER_ID_AVG_AMOUNT_30D', 0)
            std_amount = customer_features.get('CUSTOMER_ID_STD_AMOUNT_30D', 0)
            
            # Avoid division by zero
            if std_amount > 0:
                z_score = (transaction_amount - avg_amount) / std_amount
            else:
                z_score = 0.0 # If no deviation, z_score is 0
            
            return z_score
        except KeyError:
            # If the customer is new, there is no historical deviation.
            return 0.0
    
    @classmethod
    def get_latest_features(cls, customer_id: int) -> Dict[str, Any]:
        """
        Retrieves the entire row of the latest known features for a customer.
        """
        if cls._customer_df is None:
            raise RuntimeError("Feature store has not been loaded.")
        
        try:
            # .loc returns a pandas Series, we convert it to a dictionary
            return cls._customer_df.loc[customer_id].to_dict()
        except KeyError:
            # For a new customer, return an empty dict. The model logic will handle defaults
            return {}