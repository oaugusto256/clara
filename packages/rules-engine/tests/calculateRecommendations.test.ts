import { RecommendationSchema } from '@clara/schemas';
import { describe, expect, it } from 'vitest';
import { calculateRecommendations } from '../src/index';

describe('rules-engine: calculateRecommendations', () => {
  it('returns recommendations conforming to shared schema', () => {
    const recs = calculateRecommendations();
    expect(recs.length).toBeGreaterThan(0);
    for (const r of recs) {
      expect(() => RecommendationSchema.parse(r)).not.toThrow();
    }
  });
});
