interface VendorCategoryCardProps {
  title: string;
  description: string;
  mark: string;
  onClick: () => void;
}

export function VendorCategoryCard({ title, description, mark, onClick }: VendorCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="min-h-[126px] rounded-[24px] p-[17px] bg-[rgba(255,253,248,0.93)] border border-[var(--line)] shadow-[var(--shadow-card)] text-left relative overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      {/* Background Mark */}
      <div className="absolute right-2 -bottom-7 text-[82px] leading-none text-[rgba(169,22,22,0.08)] font-black pointer-events-none">
        {mark}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <strong className="block text-lg text-[#7F1010] mb-1.5">{title}</strong>
        <span className="block text-[13px] text-[#80685B] leading-[1.55]">{description}</span>
      </div>
    </button>
  );
}
