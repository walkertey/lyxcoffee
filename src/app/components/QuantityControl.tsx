interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export function QuantityControl({ quantity, onDecrease, onIncrease }: QuantityControlProps) {
  return (
    <div className="inline-grid grid-cols-[32px_34px_32px] items-center border border-[var(--line)] rounded-full overflow-hidden bg-[#fff7ea] h-[34px]">
      <button
        onClick={onDecrease}
        className="h-[34px] bg-transparent text-[var(--color-brand-red-dark)] font-black text-lg"
        aria-label="减少数量"
      >
        −
      </button>
      <span className="text-center font-extrabold text-[13px]">{quantity}</span>
      <button
        onClick={onIncrease}
        className="h-[34px] bg-transparent text-[var(--color-brand-red-dark)] font-black text-lg"
        aria-label="增加数量"
      >
        +
      </button>
    </div>
  );
}
