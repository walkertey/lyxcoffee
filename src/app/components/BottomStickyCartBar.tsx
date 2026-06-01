interface BottomStickyCartBarProps {
  itemCount: number;
  total: string;
  onViewCart: () => void;
}

export function BottomStickyCartBar({ itemCount, total, onViewCart }: BottomStickyCartBarProps) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-[60] px-[var(--space-3)] py-[var(--space-3)] pb-[calc(var(--space-3)+var(--safe-bottom))] bg-[rgba(255,246,232,0.90)] backdrop-blur-xl border-t border-[rgba(122,72,51,0.12)]">
      <div className="max-w-[1180px] mx-auto grid grid-cols-[1fr_auto] gap-[var(--card-gap)] items-center rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,#2b1711,#451b12)] text-[var(--color-surface-secondary)] px-[var(--space-3)] py-[var(--space-3)] shadow-[var(--shadow-strong)] border border-white/10">
        <div>
          <strong className="block leading-tight text-sm">
            {itemCount ? `${itemCount} 项商品 · ${total}` : "购物车是空的"}
          </strong>
          <span className="block mt-[var(--space-1)] text-[rgba(255,246,232,0.68)] text-xs">
            {itemCount ? "确认后分档口生成 WhatsApp 分单" : "点击商品加入购物车"}
          </span>
        </div>
        <button
          onClick={onViewCart}
          className="min-h-[44px] min-w-[108px] rounded-[var(--radius-lg)] px-[var(--input-padding-x)] bg-gradient-to-br from-[var(--color-whatsapp)] to-[var(--color-whatsapp-dark)] text-white font-extrabold shadow-[var(--shadow-whatsapp)] active:scale-95 transition-transform"
        >
          查看订单
        </button>
      </div>
    </div>
  );
}
