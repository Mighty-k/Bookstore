import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label,
  error,
  hint,
  multiple = false,
  searchable = false,
  clearable = false,
  disabled = false,
  fullWidth = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = multiple
    ? (value as string[]) || []
    : value
      ? [value as string]
      : [];

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option: Option) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearch("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange([]);
    } else {
      onChange("");
    }
  };

  const handleRemoveTag = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = selectedValues.filter((v) => v !== optionValue);
    onChange(newValue);
  };

  const getSelectedLabels = () => {
    return selectedValues
      .map((v) => options.find((opt) => opt.value === v)?.label)
      .filter(Boolean);
  };

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Select Trigger */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            flex items-center justify-between w-full px-3 py-2 border rounded-lg
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer hover:border-gray-400"}
            ${error ? "border-red-500" : "border-gray-300"}
            transition-colors
          `}
        >
          <div className="flex-1 flex items-center flex-wrap gap-1 min-h-[24px]">
            {multiple ? (
              selectedValues.length > 0 ? (
                getSelectedLabels().map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {label}
                    {!disabled && (
                      <X
                        size={14}
                        className="cursor-pointer hover:text-blue-600"
                        onClick={(e) =>
                          handleRemoveTag(selectedValues[index], e)
                        }
                      />
                    )}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">{placeholder}</span>
              )
            ) : (
              <span
                className={
                  selectedValues.length > 0 ? "text-gray-900" : "text-gray-400"
                }
              >
                {selectedValues.length > 0
                  ? getSelectedLabels()[0]
                  : placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {clearable && selectedValues.length > 0 && !disabled && (
              <X
                size={18}
                className="text-gray-400 hover:text-gray-600"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`
                      flex items-center justify-between px-3 py-2 cursor-pointer
                      ${option.disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:bg-gray-100"}
                      ${isSelected ? "bg-blue-50" : ""}
                      ${highlightedIndex === index ? "bg-gray-100" : ""}
                    `}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="text-sm text-gray-900">
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
    </div>
  );
};

export default Select;
