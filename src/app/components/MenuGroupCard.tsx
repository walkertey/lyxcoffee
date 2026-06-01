import { ReactNode } from "react";

interface MenuGroupCardProps {
  title: string;
  itemCount: number;
  children: ReactNode;
}

export function MenuGroupCard({ title, itemCount, children }: MenuGroupCardProps) {
  return (
    <div className="my-[var(--space-4)] rounded-[var(--radius-2xl)] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="px-[var(--card-padding)] py-[var(--input-padding-y)] border-b border-[var(--line)] bg-[linear-gradient(90deg,rgba(169,22,22,0.09),rgba(201,154,52,0.11)),rgba(255,253,248,0.94)] flex items-center justify-between gap-[var(--card-gap)]">
        <h3 className="text-[length:var(--text-h3-size)] font-[var(--text-h3-weight)] leading-[var(--text-h3-line-height)] text-[var(--color-brand-red-dark)] m-0">
          {title}
        </h3>
        <span className="inline-flex items-center justify-center min-h-[34px] px-[var(--space-3)] py-[var(--space-2)] rounded-full bg-[var(--paper)] border border-[var(--line)] text-[var(--color-text-secondary)] text-[length:var(--text-label-size)] font-[var(--text-label-weight)] leading-[var(--text-label-line-height)] whitespace-nowrap">
          {itemCount} 项
        </span>
      </div>

      {/* Items Grid */}
      <div className="grid md:grid-cols-2 gap-0 bg-[rgba(95,48,35,0.10)]">
        {children}
      </div>
    </div>
  );
}
