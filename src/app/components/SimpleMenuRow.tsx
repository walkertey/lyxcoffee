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
            <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(169,22,22,0.08)] text-[#7F1010] text-[11px] font-extrabold leading-none">
              {vendor.name}
            </span>
            <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(201,154,52,0.16)] text-[#7a560c] text-[11px] font-extrabold leading-none">
              可选规格
            </span>
          </div>
          <div className="text-base font-extrabold text-[var(--ink)] leading-tight">{item.name}</div>
          <div className="mt-1 text-[#80685B] text-xs leading-relaxed">
            {item.desc ? `${item.desc} · ${meta}` : meta}
          </div>
        </div>

        {/* Variant Buttons */}
        <div className="flex flex-wrap gap-1.5 justify-start md:justify-end md:max-w-[220px]">
          {item.variants.map(variant => (
            <button
              key={variant.id}
              onClick={() => onAddToCart(item.id, variant.id)}
              className="inline-flex items-center gap-1.5 min-h-[34px] px-2.5 py-1.5 rounded-[14px] bg-[#fff7ea] border border-[rgba(169,22,22,0.18)] text-[#7F1010] text-xs font-extrabold active:scale-95 transition-transform"
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
          <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(169,22,22,0.08)] text-[#7F1010] text-[11px] font-extrabold leading-none">
            {vendor.name}
          </span>
        </div>
        <div className="text-base font-extrabold text-[var(--ink)] leading-tight">{item.name}</div>
        <div className="mt-1 text-[#80685B] text-xs leading-relaxed">价格待确认，暂时不能加入购物车。</div>
      </div>
    );
  }

  return (
    <div className="min-h-[112px] p-4 bg-[rgba(255,253,248,0.96)] grid grid-cols-1 md:grid-cols-[1fr_210px] gap-3 items-start md:even:border-l md:border-[var(--line)]">
      {/* Main Info */}
      <div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(169,22,22,0.08)] text-[#7F1010] text-[11px] font-extrabold leading-none">
            {vendor.name}
          </span>
          <span className="inline-flex items-center min-h-[24px] px-2 py-1 rounded-full bg-[rgba(201,154,52,0.16)] text-[#7a560c] text-[11px] font-extrabold leading-none">
            {item.category || "单品"}
          </span>
        </div>
        <div className="text-base font-extrabold text-[var(--ink)] leading-tight">{item.name}</div>
        <div className="mt-1 text-[#80685B] text-xs leading-relaxed">
          {item.category ? `${item.category} · ${centsToMoney(item.price)}` : centsToMoney(item.price)}
        </div>
      </div>

      {/* Price & Add Button */}
      <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
        <div className="text-[#7F1010] font-black whitespace-nowrap">{centsToMoney(item.price)}</div>
        <button
          onClick={() => onAddToCart(item.id)}
          className="w-[38px] h-[38px] md:w-[42px] md:h-[42px] rounded-full bg-gradient-to-br from-[#A91616] to-[#7F1010] text-white text-[22px] leading-none flex items-center justify-center shadow-[0_8px_18px_rgba(169,22,22,0.20)] active:scale-95 transition-transform"
          aria-label={`加入${item.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
