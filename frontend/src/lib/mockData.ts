export interface Transaction {
    id: number;
    amount: number;
    isFraud: boolean;
    model_score?: number;
    // We can add more features like z_score, velocity etc...
}

export const mockTransactions: Transaction[] = [
    { id: 1, amount: 50, isFraud: false   , model_score: 0.1  },
    { id: 2, amount: 1500, isFraud: true  , model_score: 0.1  },
    { id: 3, amount: 25, isFraud: false   , model_score: 0.6  },
    { id: 4, amount: 300, isFraud: false  , model_score: 0.6  },
    { id: 5, amount: 950, isFraud: true   , model_score: 0.1  },
    { id: 6, amount: 120, isFraud: false  , model_score: 0.1  },
    { id: 7, amount: 2000, isFraud: true  , model_score: 0.6  },
    { id: 8, amount: 75, isFraud: false   , model_score: 0.6  },
    { id: 9, amount: 40, isFraud: false   , model_score: 0.5  },
    { id: 10, amount: 1100, isFraud: true , model_score: 0.4  },
];