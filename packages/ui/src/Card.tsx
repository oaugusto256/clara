import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized Card component for Clara UI.
 * Use for dashboard widgets, tables, charts, etc.
 */
const Card = ({ children, className = "" }: CardProps) => (
  <div
    className={`bg-gray-800 rounded-lg p-6 shadow border border-gray-700 ${className}`}
  >
    {children}
  </div>
);

export default Card;
