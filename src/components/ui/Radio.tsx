import React from "react";

interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
  hint?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    { label, error, hint, className = "", disabled, checked, ...props },
    ref,
  ) => {
    return (
      <div className={`${className}`}>
        <label className="inline-flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
            <input
              type="radio"
              ref={ref}
              className="sr-only"
              disabled={disabled}
              checked={checked}
              {...props}
            />
            <div
              className={`
              w-4 h-4 rounded-full border-2 transition-all
              ${
                disabled
                  ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                  : "bg-white border-gray-400 group-hover:border-blue-500"
              }
            `}
            >
              {checked && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </div>
          </div>

          {label && (
            <span
              className={`text-sm ${disabled ? "text-gray-400" : "text-gray-700"}`}
            >
              {label}
            </span>
          )}
        </label>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  },
);

Radio.displayName = "Radio";

export default Radio;
