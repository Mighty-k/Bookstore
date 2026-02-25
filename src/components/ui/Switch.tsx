import React from "react";

interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
  error?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    { label, description, error, className = "", disabled, checked, ...props },
    ref,
  ) => {
    return (
      <div className={`${className}`}>
        <label className="inline-flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center flex-shrink-0 mt-1">
            <input
              type="checkbox"
              ref={ref}
              className="sr-only"
              disabled={disabled}
              checked={checked}
              {...props}
            />
            <div
              className={`
              w-10 h-6 rounded-full transition-all duration-200
              ${
                disabled
                  ? "bg-gray-200 cursor-not-allowed"
                  : checked
                    ? "bg-blue-600"
                    : "bg-gray-400 group-hover:bg-gray-500"
              }
            `}
            >
              <div
                className={`
                absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200
                ${checked ? "transform translate-x-4" : ""}
              `}
              />
            </div>
          </div>

          <div className="flex-1">
            {label && (
              <span
                className={`block text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-900"}`}
              >
                {label}
              </span>
            )}
            {description && (
              <span className="block text-xs text-gray-500 mt-0.5">
                {description}
              </span>
            )}
          </div>
        </label>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

Switch.displayName = "Switch";

export default Switch;
