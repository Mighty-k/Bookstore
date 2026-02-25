import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

interface AccordionProps {
  children:
    | React.ReactElement<AccordionItemProps>
    | React.ReactElement<AccordionItemProps>[];
  allowMultiple?: boolean;
  className?: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  // title,
  children,
  // defaultOpen = false,
  // disabled = false,
}) => {
  return <>{children}</>; // This is just a wrapper, actual rendering is done by Accordion
};

const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  className = "",
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    const initialOpen = new Set<number>();
    React.Children.forEach(children, (child, index) => {
      if (child.props.defaultOpen) {
        initialOpen.add(index);
      }
    });
    return initialOpen;
  });

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {React.Children.map(children, (child, index) => {
        const isOpen = openItems.has(index);

        return (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              disabled={child.props.disabled}
              className={`
                w-full flex items-center justify-between p-4 text-left
                ${child.props.disabled ? "bg-gray-50 cursor-not-allowed" : "hover:bg-gray-50"}
                transition-colors
              `}
            >
              <span className="font-medium text-gray-900">
                {child.props.title}
              </span>
              <ChevronDown
                className={`
                  w-5 h-5 text-gray-500 transition-transform duration-200
                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {isOpen && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                {child.props.children}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { Accordion, AccordionItem };
