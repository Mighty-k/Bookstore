import React, { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = "left",
  width = "w-48",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 ${width} rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5
            ${align === "left" ? "left-0" : "right-0"}
            animate-fadeIn
          `}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  danger?: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  icon,
  danger = false,
}) => {
  return (
    <button
      className={`
        flex w-full items-center px-4 py-2 text-sm
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"}
        transition-colors
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </button>
  );
};

export { Dropdown, DropdownItem };
