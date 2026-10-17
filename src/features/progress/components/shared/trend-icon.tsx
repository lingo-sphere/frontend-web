import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface TrendIconProps {
  trend?: string;
  size?: number;
}

export function TrendIcon({ trend, size = 14 }: TrendIconProps) {
  const norm = (trend || "").toUpperCase();
  if (norm === "IMPROVING" || norm === "ACCELERATING") {
    return <TrendingUp size={size} className="text-emerald-500 inline" />;
  }
  if (norm === "DECLINING") {
    return <TrendingDown size={size} className="text-rose-500 inline" />;
  }
  return <Minus size={size} className="text-text-tertiary inline" />;
}

export default TrendIcon;

