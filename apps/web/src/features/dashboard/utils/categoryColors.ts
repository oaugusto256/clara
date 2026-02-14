// categoryColors.ts
// Centralized category color mapping for both table and pie chart

export const CATEGORY_COLORS: Record<string, string> = {
  car: '#f59e42', // orange
  food: '#3b82f6', // blue
  grocery: '#10b981', // green
  health: '#f43f5e', // red
  housing: '#6366f1', // indigo
  insurance: '#22d3ee', // cyan
  leisure: '#f472b6', // pink
  other: '#64748b', // slate
  pharmacy: '#14b8a6', // teal
  shopping: '#a21caf', // purple
  study: '#fde68a', // pale yellow
  subscription: '#8b5cf6', // deep violet
  travel: '#38bdf8', // blue sky
  // fallback for unknown categories
  default: '#a3a3a3', // gray
};

// For pie chart, provide an ordered array for color cycling
export const CATEGORY_COLOR_ARRAY = [
  CATEGORY_COLORS.food,
  CATEGORY_COLORS.car,
  CATEGORY_COLORS.grocery,
  CATEGORY_COLORS.health,
  CATEGORY_COLORS.housing,
  CATEGORY_COLORS.insurance,
  CATEGORY_COLORS.leisure,
  CATEGORY_COLORS.other,
  CATEGORY_COLORS.pharmacy,
  CATEGORY_COLORS.shopping,
  CATEGORY_COLORS.study,
  CATEGORY_COLORS.subscription,
  CATEGORY_COLORS.travel,
];
