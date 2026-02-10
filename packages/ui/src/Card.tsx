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
  <div className={`card bg-base-300 rounded-md shadow-sm z-10 ${className}`}>
    <div className="card-body p-4">{children}</div>
  </div>
);

export default Card;
