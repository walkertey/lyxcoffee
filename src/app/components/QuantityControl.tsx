interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export function QuantityControl({ quantity, onDecrease, onIncrease }: QuantityControlProps) {
  return (
    <div className="inline-grid grid-cols-[44px_auto_44px] items-center border border-[var(--line)] rounded-full overflow-hidden bg-[#fff7ea] min-h-[44px] gap-[var(--space-1)]">
      <button
        type="button"
        onClick={onDecrease}
        className="min-h-[44px] min-w-[44px] bg-transparent text-[var(--color-brand-red-dark)] font-[var(--font-weight-black)] text-[length:var(--font-size-xl)] flex items-center justify-center"
        aria-label="减少数量"
      >
        −
      </button>
      <span className="text-center font-[var(--text-button-weight)] text-[length:var(--text-body-sm-size)] leading-[var(--text-body-sm-line-height)] px-[var(--space-2)] min-w-[36px]">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="min-h-[44px] min-w-[44px] bg-transparent text-[var(--color-brand-red-dark)] font-[var(--font-weight-black)] text-[length:var(--font-size-xl)] flex items-center justify-center"
        aria-label="增加数量"
      >
        +
      </button>
    </div>
  );
}
