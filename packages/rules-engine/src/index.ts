// Minimal rules-engine entry to satisfy workspace boundaries
export type Recommendation = {
  categoryKey: string;
  recommendedPercentage: number;
  actualPercentage: number;
};

export function calculateRecommendations(): Recommendation[] {
  return [];
}
