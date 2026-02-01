// Shared domain schemas (minimal starter)
// Refer to /DOMAIN_SCHEMAS.md for canonical model

export type Money = {
  /** integer in minor units (cents) */
  amount: number;
  currency: string; // ISO 4217
};

export type User = {
  id: string;
  email: string;
  createdAt: string;
};
