import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";

interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoClose?: number;
}

const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  message,
  dismissible = true,
  onDismiss,
  autoClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  if (!isVisible) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
  };

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`rounded-lg border p-4 ${styles[type]}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="ml-auto pl-3"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
