import React from "react";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  precision?: 0.5 | 1;
  showValue?: boolean;
  className?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
  precision = 1,
  showValue = false,
  className = "",
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleMouseMove = (index: number, event: React.MouseEvent) => {
    if (!interactive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    if (precision === 0.5) {
      const isHalf = x < width / 2;
      setHoverValue(index + (isHalf ? 0.5 : 1));
    } else {
      setHoverValue(index + 1);
    }
  };

  const handleClick = () => {
    if (!interactive || !onChange || hoverValue === null) return;
    onChange(hoverValue);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverValue(null);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        {[...Array(max)].map((_, index) => {
          const isFilled = index + 1 <= Math.floor(displayValue);
          const isHalf =
            precision === 0.5 &&
            displayValue % 1 !== 0 &&
            index === Math.floor(displayValue);

          return (
            <div
              key={index}
              className={`relative ${interactive ? "cursor-pointer" : ""}`}
              onMouseMove={(e) => handleMouseMove(index, e)}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
            >
              {isHalf ? (
                <div className="relative">
                  <Star
                    className={`${sizeClasses[size]} text-gray-300 fill-current`}
                  />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star
                      className={`${sizeClasses[size]} text-yellow-400 fill-current`}
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={`
                    ${sizeClasses[size]}
                    ${isFilled ? "text-yellow-400 fill-current" : "text-gray-300"}
                    transition-colors
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
