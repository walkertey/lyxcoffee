interface BottomStickyCartBarProps {
  itemCount: number;
  total: string;
  onViewCart: () => void;
}

export function BottomStickyCartBar({ itemCount, total, onViewCart }: BottomStickyCartBarProps) {
  return (
    <div className="fixed left-0 right-0 bottom-0 z-[60] px-3 py-2.5 pb-[calc(10px+var(--safe-bottom))] bg-[rgba(255,246,232,0.90)] backdrop-blur-xl border-t border-[rgba(122,72,51,0.12)]">
      <div className="max-w-[1180px] mx-auto grid grid-cols-[1fr_auto] gap-2.5 items-center rounded-[22px] bg-[linear-gradient(135deg,#2b1711,#451b12)] text-[#fff6e8] px-3 py-2.5 shadow-[0_16px_40px_rgba(51,20,12,0.22)] border border-white/10">
        <div>
          <strong className="block leading-tight text-sm">
            {itemCount ? `${itemCount} 项商品 · ${total}` : "购物车是空的"}
          </strong>
          <span className="block mt-0.5 text-[rgba(255,246,232,0.68)] text-xs">
            {itemCount ? "查看购物车并生成分单" : "点击商品加入购物车"}
          </span>
        </div>
        <button
          onClick={onViewCart}
          className="min-h-[44px] min-w-[108px] rounded-2xl px-3.5 bg-gradient-to-br from-[#118C43] to-[#0F6F37] text-white font-extrabold shadow-[0_12px_24px_rgba(17,140,67,0.22)] active:scale-95 transition-transform"
        >
          查看
        </button>
      </div>
    </div>
  );
}
