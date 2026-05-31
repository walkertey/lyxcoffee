interface OrderTypeSegmentedControlProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function OrderTypeSegmentedControl({ selectedType, onSelectType }: OrderTypeSegmentedControlProps) {
  const types = ["堂食", "打包", "自取"];

  return (
    <div className="grid grid-cols-3 gap-2 bg-[#fff7ea] border border-[var(--line)] rounded-[18px] p-1.5">
      {types.map(type => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className={`
            min-h-[46px] rounded-[14px] font-extrabold transition-all
            ${
              selectedType === type
                ? "bg-gradient-to-br from-[#A91616] to-[#7F1010] text-white shadow-[0_10px_22px_rgba(169,22,22,0.18)]"
                : "bg-transparent text-[#80685B]"
            }
          `}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
