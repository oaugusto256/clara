export { categorizeTransactions, SimpleTransaction } from './groupTransactions';
import { RecommendationSchema, Recommendation as SharedRecommendation } from '@clara/schemas';

// Minimal rules-engine entry to satisfy workspace boundaries
export type Recommendation = SharedRecommendation;

export function calculateRecommendations(): Recommendation[] {
  const r: Recommendation = {
    categoryKey: 'food',
    recommendedPercentage: 0.15,
    actualPercentage: 0.2,
    recommendedAmount: { amount: 15000, currency: 'BRL' },
    actualAmount: { amount: 20000, currency: 'BRL' },
    status: 'above',
    explanation: 'You spent more than recommended',
  };

  // runtime validation using shared schema
  RecommendationSchema.parse(r);

  return [r];
}
