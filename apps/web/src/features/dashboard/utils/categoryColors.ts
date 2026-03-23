// categoryColors.ts
// Centralized category color mapping for both table and pie chart

export const CATEGORY_COLORS: Record<string, string> = {
  housing: '#6366f1',      // indigo
  food: '#3b82f6',         // blue
  transport: '#f59e42',    // orange
  health: '#f43f5e',       // red
  education: '#fde68a',    // pale yellow
  leisure: '#f472b6',      // pink
  subscriptions: '#8b5cf6', // violet
  savings: '#10b981',      // green
  other: '#64748b',        // slate
  // fallback for unknown categories
  default: '#a3a3a3',      // gray
};

export const DEFAULT_CATEGORY_COLOR = CATEGORY_COLORS.default;

// For pie chart — ordered color cycling (fallback for when DB colors are unavailable)
export const CATEGORY_COLOR_ARRAY = [
  CATEGORY_COLORS.housing,
  CATEGORY_COLORS.food,
  CATEGORY_COLORS.transport,
  CATEGORY_COLORS.health,
  CATEGORY_COLORS.education,
  CATEGORY_COLORS.leisure,
  CATEGORY_COLORS.subscriptions,
  CATEGORY_COLORS.savings,
  CATEGORY_COLORS.other,
];
