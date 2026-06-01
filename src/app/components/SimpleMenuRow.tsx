import { useState } from "react";
import { MenuItem } from "../types";
import { vendors } from "../data";
import { centsToMoney, moneyShort } from "../utils";

interface SimpleMenuRowProps {
  item: MenuItem;
  onAddToCart: (itemId: string, variantId?: string) => void;
}

const badgeClass =
  "inline-flex items-center min-h-[24px] px-[var(--space-2)] py-[var(--space-1)] rounded-full text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)]";

export function SimpleMenuRow({ item, onAddToCart }: SimpleMenuRowProps) {
  const vendor = vendors[item.vendorId];
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (variantId?: string) => {
    if (isAdding) return;
    setIsAdding(true);
    onAddToCart(item.id, variantId);
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  if (item.variants) {
    const meta = item.variants.map(v => `${v.label} ${centsToMoney(v.price)}`).join(" · ");

    return (
      <div className="min-h-[112px] p-[var(--card-padding)] bg-[rgba(255,253,248,0.96)] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[var(--card-gap)] items-start md:even:border-l md:border-[var(--line)]">
        {/* Main Info */}
        <div>
          <div className="flex flex-wrap gap-[var(--space-2)] mb-[var(--space-2)]">
            <span className={`${badgeClass} bg-[rgba(169,22,22,0.08)] text-[var(--color-brand-red-dark)]`}>
              {vendor.name}
            </span>
            <span className={`${badgeClass} bg-[rgba(201,154,52,0.16)] text-[#7a560c]`}>
              可选规格
            </span>
          </div>
          <div className="text-[length:var(--text-body-size)] font-[var(--font-weight-extrabold)] text-[var(--ink)] leading-[var(--line-height-tight)]">
            {item.name}
          </div>
          <div className="mt-[var(--space-1)] text-[var(--color-text-secondary)] text-[length:var(--text-caption-size)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line-height)]">
            {item.desc ? `${item.desc} · ${meta}` : meta}
          </div>
        </div>

        {/* Variant Buttons */}
        <div className="flex flex-wrap gap-[var(--space-2)] justify-start md:justify-end md:max-w-[220px]">
          {item.variants.map(variant => (
            <button
              key={variant.id}
              type="button"
              onClick={() => handleAdd(variant.id)}
              disabled={isAdding}
              className={`inline-flex items-center gap-[var(--space-2)] min-h-[34px] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-xs)] text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] transition-all ${
                isAdding
                  ? "bg-[#10B981] text-white scale-95 border border-[#10B981]"
                  : "bg-[#fff7ea] border border-[rgba(169,22,22,0.18)] text-[var(--color-brand-red-dark)] active:scale-95"
              }`}
            >
              <span>{variant.label}</span>
              <strong className="font-[var(--font-weight-black)]">{moneyShort(variant.price)}</strong>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (typeof item.price !== "number") {
    return (
      <div className="min-h-[112px] p-[var(--card-padding)] bg-[rgba(255,253,248,0.96)] grid grid-cols-1 gap-[var(--card-gap)] items-start md:even:border-l md:border-[var(--line)]">
        <div className="flex flex-wrap gap-[var(--space-2)] mb-[var(--space-2)]">
          <span className={`${badgeClass} bg-[rgba(169,22,22,0.08)] text-[var(--color-brand-red-dark)]`}>
            {vendor.name}
          </span>
        </div>
        <div className="text-[length:var(--text-body-size)] font-[var(--font-weight-extrabold)] text-[var(--ink)] leading-[var(--line-height-tight)]">
          {item.name}
        </div>
        <div className="mt-[var(--space-1)] text-[var(--color-text-secondary)] text-[length:var(--text-caption-size)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line-height)]">
          价格待确认，暂时不能加入购物车。
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[112px] p-[var(--card-padding)] bg-[rgba(255,253,248,0.96)] grid grid-cols-1 md:grid-cols-[1fr_210px] gap-[var(--card-gap)] items-start md:even:border-l md:border-[var(--line)]">
      {/* Main Info */}
      <div>
        <div className="flex flex-wrap gap-[var(--space-2)] mb-[var(--space-2)]">
          <span className={`${badgeClass} bg-[rgba(169,22,22,0.08)] text-[var(--color-brand-red-dark)]`}>
            {vendor.name}
          </span>
          <span className={`${badgeClass} bg-[rgba(201,154,52,0.16)] text-[#7a560c]`}>
            {item.category || "单品"}
          </span>
        </div>
        <div className="text-[length:var(--text-body-size)] font-[var(--font-weight-extrabold)] text-[var(--ink)] leading-[var(--line-height-tight)]">
          {item.name}
        </div>
        <div className="mt-[var(--space-1)] text-[var(--color-text-secondary)] text-[length:var(--text-caption-size)] font-[var(--text-caption-weight)] leading-[var(--text-caption-line-height)]">
          {item.category ? `${item.category} · ${centsToMoney(item.price)}` : centsToMoney(item.price)}
        </div>
      </div>

      {/* Price & Add Button */}
      <div className="flex items-center justify-between md:flex-col md:items-end gap-[var(--space-2)]">
        <div className="text-[var(--color-brand-red-dark)] font-[var(--font-weight-black)] whitespace-nowrap">
          {centsToMoney(item.price)}
        </div>
        <button
          type="button"
          onClick={() => handleAdd()}
          disabled={isAdding}
          className={`min-h-[38px] px-[var(--button-padding-x)] rounded-[var(--radius-xs)] text-[length:var(--text-label-size)] font-[var(--text-button-weight)] leading-[var(--text-button-line-height)] flex items-center justify-center transition-all ${
            isAdding
              ? "bg-[#10B981] text-white scale-95"
              : "bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-red-dark)] text-white shadow-[var(--shadow-brand-light)] active:scale-95"
          }`}
          aria-label={`加入${item.name}`}
        >
          {isAdding ? "✓" : "加入"}
        </button>
      </div>
    </div>
  );
}
