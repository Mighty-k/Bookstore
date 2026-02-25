import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = "md",
  color = "blue",
  showLabel = false,
  label,
  animated = false,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-500",
    purple: "bg-purple-600",
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-gray-700">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`
            ${colorClasses[color]} 
            ${sizeClasses[size]} 
            rounded-full transition-all duration-300
            ${animated ? "animate-pulse" : ""}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
