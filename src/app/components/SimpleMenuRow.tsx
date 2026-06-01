import { MenuItem } from "../types";
import { vendors } from "../data";
import { centsToMoney, moneyShort } from "../utils";

interface SimpleMenuRowProps {
  item: MenuItem;
  onAddToCart: (itemId: string, variantId?: string) => void;
}

export function SimpleMenuRow({ item, onAddToCart }: SimpleMenuRowProps) {
  const vendor = vendors[item.vendorId];

  if (item.variants) {
    const meta = item.variants.map(v => `${v.label} ${centsToMoney(v.price)}`).join(" · ");

    return (
      <div className="min-h-[112px] p-4 bg-[rgba(255,253,248,0.96)] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-start md:even:border-l md:border-[var(--line)]">
        {/* Main Info */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(169,22,22,0.08)] text-[var(--color-brand-red-dark)] text-[11px] font-extrabold leading-none">
              {vendor.name}
            </span>
            <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(201,154,52,0.16)] text-[#7a560c] text-[11px] font-extrabold leading-none">
              可选规格
            </span>
          </div>
          <div className="text-base font-extrabold text-[var(--ink)] leading-tight">{item.name}</div>
          <div className="mt-1 text-[var(--color-text-secondary)] text-xs leading-relaxed">
            {item.desc ? `${item.desc} · ${meta}` : meta}
          </div>
        </div>

        {/* Variant Buttons */}
        <div className="flex flex-wrap gap-1.5 justify-start md:justify-end md:max-w-[220px]">
          {item.variants.map(variant => (
            <button
              key={variant.id}
              onClick={() => onAddToCart(item.id, variant.id)}
              className="inline-flex items-center gap-1.5 min-h-[34px] px-2.5 py-1.5 rounded-[var(--radius-xs)] bg-[#fff7ea] border border-[rgba(169,22,22,0.18)] text-[var(--color-brand-red-dark)] text-xs font-extrabold active:scale-95 transition-transform"
            >
              <span>{variant.label}</span>
              <strong className="font-black">{moneyShort(variant.price)}</strong>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (typeof item.price !== "number") {
    return (
      <div className="min-h-[112px] p-4 bg-[rgba(255,253,248,0.96)] grid grid-cols-1 gap-3 items-start md:even:border-l md:border-[var(--line)]">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(169,22,22,0.08)] text-[var(--color-brand-red-dark)] text-[11px] font-extrabold leading-none">
            {vendor.name}
          </span>
        </div>
        <div className="text-base font-extrabold text-[var(--ink)] leading-tight">{item.name}</div>
        <div className="mt-1 text-[var(--color-text-secondary)] text-xs leading-relaxed">价格待确认，暂时不能加入购物车。</div>
      </div>
    );
  }

  return (
    <div className="min-h-[112px] p-4 bg-[rgba(255,253,248,0.96)] grid grid-cols-1 md:grid-cols-[1fr_210px] gap-3 items-start md:even:border-l md:border-[var(--line)]">
      {/* Main Info */}
      <div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(169,22,22,0.08)] text-[var(--color-brand-red-dark)] text-[11px] font-extrabold leading-none">
            {vendor.name}
          </span>
          <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(201,154,52,0.16)] text-[#7a560c] text-[11px] font-extrabold leading-none">
            {item.category || "单品"}
          </span>
        </div>
        <div className="text-base font-extrabold text-[var(--ink)] leading-tight">{item.name}</div>
        <div className="mt-1 text-[var(--color-text-secondary)] text-xs leading-relaxed">
          {item.category ? `${item.category} · ${centsToMoney(item.price)}` : centsToMoney(item.price)}
        </div>
      </div>

      {/* Price & Add Button */}
      <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
        <div className="text-[var(--color-brand-red-dark)] font-black whitespace-nowrap">{centsToMoney(item.price)}</div>
        <button
          onClick={() => onAddToCart(item.id)}
          className="min-h-[38px] px-4 rounded-[var(--radius-xs)] bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-red-dark)] text-white text-xs font-extrabold flex items-center justify-center shadow-[var(--shadow-brand-light)] active:scale-95 transition-transform"
          aria-label={`加入${item.name}`}
        >
          加入
        </button>
      </div>
    </div>
  );
}
