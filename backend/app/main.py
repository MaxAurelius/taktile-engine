from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from .schemas import ExecutionRequest, ExecutionTrace, Transaction, ProfileData 
from .engine import ExecutionEngine
from .services import ModelLoader, FeatureStore
import logging
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "./models/xgboost_v1.joblib"
FEATURE_STORE_PATH = BASE_DIR / "./data/feature_store.parquet"
NAMES = ["Amelia Chen", "Ben Carter", "Chloe Davis", "David Rodriguez", "Eva Williams", "Frank Miller", "Grace Lee", "Henry Jones"]
CATEGORIES = ["Groceries", "Utilities", "Transport", "Dining", "Software", "Travel", "Electronics", "Books"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application startup...")
    ModelLoader.load_model(MODEL_PATH)
    FeatureStore.load_feature_store(FEATURE_STORE_PATH)
    yield
    logger.info("Application shutdown...")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Decision Engine API", lifespan=lifespan)
engine = ExecutionEngine()

origins = [
    "http://localhost:3000",
     "https://www.taktile-engine.xyz",
     "https://www.taktile-engine.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Decision Engine is running"}


@app.get("/profiles/{customer_id}", response_model=ProfileData)
def get_customer_profile(customer_id: int):
    """
    Fetches aggregated features for a customer and enriches it with mock data.
    """
    if FeatureStore._customer_df is None:
        raise HTTPException(status_code=503, detail="Feature store not loaded.")
    
    try:
        customer_data = FeatureStore._customer_df.loc[customer_id]
        
        # Deterministically generate a name based on customer_id
        customer_name = NAMES[customer_id % len(NAMES)]

        profile = ProfileData(
            name=customer_name,
            customerId=str(customer_id),
            # Extract real aggregated features from our feature store
            avgTransaction=customer_data.get('CUSTOMER_ID_AVG_AMOUNT_30D', 0),
            activityLevel=int(customer_data.get('CUSTOMER_ID_NB_TX_30D', 0)),
            # For V1, categories are mocked but could be derived in a real system
            typicalCategories=CATEGORIES[(customer_id % 4):(customer_id % 4) + 3]
        )
        return profile
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Customer with id {customer_id} not found.")


@app.get("/transactions/next", response_model=Transaction)
def get_next_transaction():
    """
    Fetches a random transaction from the in-memory feature store DataFrame.
    This ensures that any transaction served has corresponding historical data
    """
    if FeatureStore._customer_df is None or FeatureStore._customer_df.empty:
        raise HTTPException(status_code=503, detail="Feature store is not loaded or is empty.")

    # Select a random row from the DataFrame
    random_transaction_series = FeatureStore._customer_df.sample(n=1).iloc[0]

    # Map the DataFrame columns to our Transaction Pydantic model
    # The customer ID is the index of the series after our loading logic
    transaction = Transaction(
        id=int(random_transaction_series.name),
        amount=random_transaction_series['TX_AMOUNT'],
        isFraud=bool(random_transaction_series['TX_FRAUD'])
    )
    return transaction

@app.post("/strategy/execute", response_model=ExecutionTrace)
def execute_strategy(request: ExecutionRequest):
    logger.info(f"Received execution request for transaction ID: {request.transaction.id}")
    logger.info(f"Blueprint contains {len(request.blueprint.nodes)} nodes and {len(request.blueprint.edges)} edges.")
    
    try:
        trace = engine.execute(request.blueprint, request.transaction)
        logger.info("Execution successful. Returning trace.")
        return trace
    except ValueError as e:
        logger.error(f"Execution error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during execution.")
    
@app.post("/simulation/reset")
def reset_simulation():
    """Resets the engine's performance metrics to zero."""
    engine.reset()
    return {"status": "ok", "message": "Simulation metrics reset."}