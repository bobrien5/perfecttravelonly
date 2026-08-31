interface ChipProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export default function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`border-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
