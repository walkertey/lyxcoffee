import { useEffect, useState } from "react";

type ToastType = "default" | "success" | "error" | "info";

interface ToastNotificationProps {
  message: string;
  show: boolean;
  onHide: () => void;
  type?: ToastType;
  duration?: number;
}

const toastConfig: Record<ToastType, { bg: string; textColor: string; icon: string }> = {
  default: {
    bg: "bg-[rgba(42,23,18,0.94)]",
    textColor: "text-[var(--color-surface-secondary)]",
    icon: "💬"
  },
  success: {
    bg: "bg-[rgba(16,185,129,0.92)]",
    textColor: "text-white",
    icon: "✓"
  },
  error: {
    bg: "bg-[rgba(220,38,38,0.92)]",
    textColor: "text-white",
    icon: "✕"
  },
  info: {
    bg: "bg-[rgba(59,130,246,0.92)]",
    textColor: "text-white",
    icon: "ℹ"
  }
};

export function ToastNotification({ 
  message, 
  show, 
  onHide, 
  type = "default",
  duration = 1700
}: ToastNotificationProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setIsLeaving(false);
      const timer = setTimeout(() => {
        setIsLeaving(true);
        const hideTimer = setTimeout(onHide, 300);
        return () => clearTimeout(hideTimer);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, duration]);

  const config = toastConfig[type];
  const animationClass = show && !isLeaving ? "toast-slide-up" : "toast-slide-down";
  const visibilityClass = show && !isLeaving ? "opacity-100" : "opacity-0";

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2 z-[90] max-w-[min(92vw,440px)] px-4 py-3 rounded-[var(--radius-lg)]
        ${config.bg} ${config.textColor} shadow-[0_12px_32px_rgba(0,0,0,0.24)]
        text-sm text-center font-medium flex items-center justify-center gap-2
        transition-opacity pointer-events-none
        ${visibilityClass}
        ${show && !isLeaving ? "bottom-[calc(var(--cartbar-h)+20px+var(--safe-bottom))]" : "bottom-[calc(var(--cartbar-h)+4px+var(--safe-bottom))]"}
        ${animationClass}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-lg flex-shrink-0">{config.icon}</span>
      <span className="flex-1">{message}</span>
    </div>
  );
}
