import React from "react";
import { Check, Minus } from "lucide-react";

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  indeterminate?: boolean;
  error?: string;
  hint?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      indeterminate = false,
      error,
      hint,
      className = "",
      disabled,
      checked,
      ...props
    },
    // ref,
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className={`${className}`}>
        <label className="inline-flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              ref={checkboxRef}
              className="sr-only"
              disabled={disabled}
              checked={checked}
              {...props}
            />
            <div
              className={`
              w-4 h-4 border-2 rounded transition-all
              ${
                disabled
                  ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                  : "bg-white border-gray-400 group-hover:border-blue-500"
              }
              ${checked || indeterminate ? "!bg-blue-600 !border-blue-600" : ""}
            `}
            >
              {checked && !indeterminate && (
                <Check className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              )}
              {indeterminate && (
                <Minus className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
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

Checkbox.displayName = "Checkbox";

export default Checkbox;
