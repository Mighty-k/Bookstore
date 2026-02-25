import React, { forwardRef } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = "",
      type = "text",
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputType =
      type === "password" ? (showPassword ? "text" : "password") : type;

    const baseClasses =
      "block rounded-lg border transition-all duration-200 outline-none";
    const stateClasses = error
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
      : success
        ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

    const paddingClasses = `
    ${leftIcon ? "pl-10" : "pl-4"}
    ${rightIcon || type === "password" ? "pr-10" : "pr-4"}
  `;

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={`
            ${baseClasses}
            ${stateClasses}
            ${paddingClasses}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            ${isFocused ? "ring-2 ring-blue-200" : ""} 
            w-full py-2
          `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {(rightIcon || type === "password") && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {type === "password" ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {/* Error/Success/Hint Messages */}
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}

        {success && !error && (
          <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
            <CheckCircle size={14} />
            {success}
          </p>
        )}

        {hint && !error && !success && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
