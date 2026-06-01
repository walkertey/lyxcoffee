interface OrderTypeSegmentedControlProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function OrderTypeSegmentedControl({ selectedType, onSelectType }: OrderTypeSegmentedControlProps) {
  const types = ["堂食", "打包", "自取"];

  return (
    <div className="grid grid-cols-3 gap-2 bg-[#fff7ea] border border-[var(--line)] rounded-[var(--radius-md)] p-1.5">
      {types.map(type => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className={`
            min-h-[46px] rounded-[var(--radius-xs)] font-extrabold transition-all
            ${
              selectedType === type
                ? "bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-red-dark)] text-white shadow-[var(--shadow-brand)]"
                : "bg-transparent text-[var(--color-text-secondary)]"
            }
          `}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
