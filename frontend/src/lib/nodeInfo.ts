export const nodeInfo: { [key: string]: string } = {
    // Inputs
    'Transaction Stream': 'The origin point of all strategies. It emits raw transaction data for processing.',

    // Features
    'Spending Deviation': 'Calculates how much a transaction amount deviates from the customer\'s average spending. Outputs a numeric feature.',
    'Velocity Counter (24h)': 'Counts the number of transactions for a customer in a rolling 24-hour window. Outputs a numeric feature.',
    'Terminal Risk Score': 'Fetches a pre-computed risk score from an external terminal monitoring service. Outputs a numeric feature.',

    // Models
    'XGBoost Model': 'A gradient boosting model that predicts the probability of fraud. Expects engineered features like "Spending Deviation" and "Velocity". Outputs a risk score (0.0 - 1.0).',
    'Isolation Forest Model': 'An anomaly detection model ideal for identifying unusual patterns. Expects raw numerical features. Outputs a risk score (0.0 - 1.0).',

    // Logic
    'Amount Gate': 'A simple rule that branches the flow based on the transaction amount. It checks if the amount is greater than or equal to its parameter value.',
    'Threshold Gate': 'Converts a probabilistic model score into a binary decision. It checks if the incoming score is greater than or equal to its parameter value (the risk threshold).',
    'AND Gate': 'Logical AND. Continues the flow only if all incoming paths are TRUE.',
    'OR Gate': 'Logical OR. Continues the flow if at least one incoming path is TRUE.',

    // Actions
    'APPROVE': 'A terminal node that represents a final decision to approve the transaction.',
    'BLOCK': 'A terminal node that represents a final decision to block the transaction.',
    'REVIEW': 'A terminal node that flags the transaction for manual review by an analyst.',
};