import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  let timeout: ReturnType<typeof setTimeout>;

  useEffect(() => {
    if (isVisible && targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = targetRect.top - tooltipRect.height - 8;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = targetRect.bottom + 8;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 8;
          break;
        case "right":
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 8;
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 10;
      top = Math.max(
        padding,
        Math.min(top, window.innerHeight - tooltipRect.height - padding),
      );
      left = Math.max(
        padding,
        Math.min(left, window.innerWidth - tooltipRect.width - padding),
      );

      setCoords({ top, left });
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap"
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          {content}
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 transform rotate-45
              ${position === "top" ? "bottom-[-4px] left-1/2 -translate-x-1/2" : ""}
              ${position === "bottom" ? "top-[-4px] left-1/2 -translate-x-1/2" : ""}
              ${position === "left" ? "right-[-4px] top-1/2 -translate-y-1/2" : ""}
              ${position === "right" ? "left-[-4px] top-1/2 -translate-y-1/2" : ""}
            `}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;
