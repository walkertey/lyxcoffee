import { CartLine } from "../types";
import { centsToMoney, getCartItemTotalCents, getLineUnitCents } from "../utils";
import { QuantityControl } from "./QuantityControl";

interface CartVendorGroupProps {
  vendorName: string;
  lines: CartLine[];
  subtotal: number;
  onChangeQty: (key: string, delta: number) => void;
  onUpdateNote: (key: string, note: string) => void;
}

export function CartVendorGroup({ vendorName, lines, subtotal, onChangeQty, onUpdateNote }: CartVendorGroupProps) {
  return (
    <div className="bg-[rgba(255,253,248,0.94)] border-t border-[var(--line)] first:border-t-0">
      {/* Vendor Header */}
      <div className="px-4 py-[14px] bg-[linear-gradient(90deg,rgba(169,22,22,0.10),rgba(201,154,52,0.13))] text-[var(--color-brand-red-dark)] font-black flex items-center justify-between gap-3">
        <span>{vendorName}</span>
        <span>{centsToMoney(subtotal)}</span>
      </div>

      {/* Cart Lines */}
      <div className="grid gap-px bg-[var(--line)]">
        {lines.map(line => (
          <div
            key={line.key}
            className="bg-[rgba(255,253,248,0.98)] p-[13px] md:p-4 grid grid-cols-1 md:grid-cols-[1fr_210px] gap-3 min-h-[104px]"
          >
            {/* Line Info */}
            <div>
              <div className="font-extrabold leading-tight">
                {line.name}
                {line.variantLabel && ` · ${line.variantLabel}`}
              </div>
              <div className="mt-1 text-[var(--color-text-secondary)] text-xs leading-relaxed">
                {centsToMoney(getLineUnitCents(line))} × {line.qty} = {centsToMoney(getCartItemTotalCents(line))}
              </div>
              <textarea
                value={line.note}
                onChange={(e) => onUpdateNote(line.key, e.target.value)}
                maxLength={80}
                className="mt-2 w-full min-h-[38px] border border-[var(--line)] rounded-[var(--radius-xs)] px-2.5 py-2 bg-[var(--paper)] text-[var(--ink)] outline-none resize-y text-[13px] focus:border-[rgba(169,22,22,0.42)] focus:shadow-[var(--shadow-focus)]"
                placeholder="此商品备注：不要葱、少甜、少辣、分开装"
              />
            </div>

            {/* Line Actions */}
            <div className="grid md:grid-cols-1 grid-flow-col md:grid-flow-row gap-2 justify-items-start md:justify-items-end items-start md:items-center justify-between md:justify-start">
              <div className="text-[var(--color-brand-red-dark)] font-black">{centsToMoney(getCartItemTotalCents(line))}</div>
              <QuantityControl
                quantity={line.qty}
                onDecrease={() => onChangeQty(line.key, -1)}
                onIncrease={() => onChangeQty(line.key, 1)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
