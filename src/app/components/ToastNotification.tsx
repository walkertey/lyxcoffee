import { useEffect, useState } from "react";

interface ToastNotificationProps {
  message: string;
  show: boolean;
  onHide: () => void;
}

export function ToastNotification({ message, show, onHide }: ToastNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 1700);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div
      className={`
        fixed left-1/2 -translate-x-1/2 z-[90] max-w-[min(92vw,420px)] px-[15px] py-3 rounded-2xl
        bg-[rgba(42,23,18,0.94)] text-[#fff6e8] shadow-[var(--shadow)] text-sm text-center
        transition-all duration-150
        ${show ? "opacity-100 bottom-[calc(var(--cartbar-h)+26px+var(--safe-bottom))]" : "opacity-0 bottom-[calc(var(--cartbar-h)+34px+var(--safe-bottom))] pointer-events-none"}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
