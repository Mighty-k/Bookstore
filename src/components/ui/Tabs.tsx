import React, { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  fullWidth?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
  variant = "default",
  fullWidth = false,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);
  const activeTab = controlledActiveTab || internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (onChange) {
      onChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const variantClasses = {
    default: {
      container: "border-b border-gray-200",
      tab: (isActive: boolean, disabled: boolean) => `
        px-4 py-2 text-sm font-medium
        ${
          isActive
            ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
            : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `,
    },
    pills: {
      container: "space-x-2",
      tab: (isActive: boolean, disabled: boolean) => `
        px-4 py-2 text-sm font-medium rounded-lg
        ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-700 bg-gray-100 hover:bg-gray-200"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `,
    },
    underline: {
      container: "",
      tab: (isActive: boolean, disabled: boolean) => `
        px-4 py-2 text-sm font-medium relative
        ${
          isActive
            ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `,
    },
  };

  return (
    <div
      className={`flex ${variantClasses[variant].container} ${fullWidth ? "w-full" : ""}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && handleTabClick(tab.id)}
          className={`
            ${variantClasses[variant].tab(activeTab === tab.id, !!tab.disabled)}
            ${fullWidth ? "flex-1 text-center" : ""}
            flex items-center justify-center gap-2 transition-all
          `}
          disabled={tab.disabled}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
