import { ReactNode } from "react";

interface MenuGroupCardProps {
  title: string;
  itemCount: number;
  children: ReactNode;
}

export function MenuGroupCard({ title, itemCount, children }: MenuGroupCardProps) {
  return (
    <div className="my-4 rounded-[26px] bg-[var(--paper)] border border-[var(--line)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-[14px] border-b border-[var(--line)] bg-[linear-gradient(90deg,rgba(169,22,22,0.09),rgba(201,154,52,0.11)),rgba(255,253,248,0.94)] flex items-center justify-between gap-3">
        <h3 className="text-lg text-[#7F1010] font-black m-0">{title}</h3>
        <span className="inline-flex items-center justify-center min-h-[34px] px-3 py-1.5 rounded-full bg-[var(--paper)] border border-[var(--line)] text-[#80685B] text-xs font-extrabold whitespace-nowrap">
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
