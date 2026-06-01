interface PromoImageCardProps {
  onViewCart: () => void;
}

export function PromoImageCard({ onViewCart }: PromoImageCardProps) {
  return (
    <div className="mt-[var(--space-5)] min-h-[230px] md:min-h-[280px] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--line)] shadow-[var(--shadow-card)] promo-kopitiam bg-cover bg-center text-[#fff8eb] flex items-end p-[var(--space-6)] md:p-[var(--space-8)] relative">
      {/* Inner Border */}
      <div className="absolute inset-[var(--space-3)] border border-[rgba(255,231,178,0.20)] rounded-[calc(var(--radius-xl)-8px)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-[600px]">
        <span className="inline-flex items-center rounded-full px-[var(--space-3)] py-[var(--space-2)] bg-[rgba(255,255,255,0.13)] border border-white/18 text-[#FFE7B2] text-xs font-extrabold">
          本地 kopitiam · WhatsApp 点餐
        </span>

        <h2 className="mt-[var(--space-3)] text-[clamp(28px,8vw,52px)] leading-[1.03] text-[#fff8eb] font-black">
          一杯好咖啡，一段好时光
        </h2>

        <p className="max-w-[560px] mt-[var(--space-2)] mb-[var(--space-4)] text-[rgba(255,248,235,0.88)] leading-[1.72]">
          水档、面档、煮炒、广西卷肠粉集中点餐，系统按档口自动整理分单。
        </p>

        <button
          onClick={onViewCart}
          className="min-h-[48px] rounded-[var(--radius-sm)] px-[var(--button-padding-x)] py-[var(--button-padding-y)] bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-red-dark)] text-white font-extrabold flex items-center justify-center gap-[var(--space-2)] shadow-[var(--shadow-brand-heavy)] active:translate-y-0.5 transition-transform"
        >
          查看购物车
        </button>
      </div>
    </div>
  );
}
