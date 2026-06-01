interface WhatsAppSendCardProps {
  vendorName: string;
  itemCount: number;
  subtotal: string;
  whatsappUrl: string;
  hasOpened: boolean;
  isSent: boolean;
  onOpen: () => void;
  onMarkSent: () => void;
  onCopy: () => void;
}

export function WhatsAppSendCard({
  vendorName,
  itemCount,
  subtotal,
  whatsappUrl,
  hasOpened,
  isSent,
  onOpen,
  onMarkSent,
  onCopy
}: WhatsAppSendCardProps) {
  const statusLabel = isSent ? "已确认发送" : hasOpened ? "已打开 WhatsApp" : "待发送";

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[rgba(255,251,245,0.88)] p-[14px] grid gap-2.5">
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-black text-[var(--color-brand-red-dark)]">{vendorName}</div>
          <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {itemCount} 项 · {subtotal}
          </div>
        </div>
        <span
          className={`
            rounded-full px-2 py-1 text-xs font-extrabold whitespace-nowrap
            ${isSent ? "bg-[#e7f8ec] text-[#0c7132]" : hasOpened ? "bg-[#fff1d4] text-[#8d5b00]" : "bg-[#fff1d4] text-[#8d5b00]"}
          `}
        >
          {statusLabel}
        </span>
      </div>

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onOpen}
        className="min-h-[48px] rounded-[var(--radius-lg)] px-4 py-3 font-extrabold flex items-center justify-center bg-gradient-to-br from-[var(--color-whatsapp)] to-[var(--color-whatsapp-dark)] text-white shadow-[var(--shadow-whatsapp)] active:scale-95 transition-transform"
      >
        {hasOpened ? `再次打开${vendorName} WhatsApp` : `打开${vendorName} WhatsApp`}
      </a>

      {/* Mark Sent Button */}
      <button
        type="button"
        onClick={onMarkSent}
        disabled={isSent || !hasOpened}
        aria-disabled={isSent || !hasOpened}
        className={`min-h-[44px] rounded-[var(--radius-lg)] px-4 py-2.5 border font-extrabold transition-transform ${
          isSent
            ? "bg-[#e7f8ec] border-[#bce9c9] text-[#0c7132] cursor-default"
            : hasOpened
              ? "bg-[rgba(17,140,67,0.08)] border-[rgba(17,140,67,0.22)] text-[var(--color-whatsapp-dark)] active:scale-95"
              : "bg-[#f3eee8] border-[var(--line)] text-[#9d8b80] cursor-not-allowed"
        }`}
      >
        {isSent ? "已确认发送" : hasOpened ? "我已发送给档口" : "请先打开 WhatsApp"}
      </button>

      {/* Copy Button */}
      <button
        onClick={onCopy}
        className="min-h-[48px] rounded-[var(--radius-lg)] px-4 py-3 bg-[rgba(255,253,248,0.55)] border border-[var(--line)] text-[var(--color-brand-red-dark)] font-extrabold active:scale-95 transition-transform"
      >
        复制分单文字
      </button>
    </div>
  );
}
