interface OptionCardProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}

export default function OptionCard({ label, emoji, selected, onClick, className = '' }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`border-2 rounded-xl p-4 text-center font-semibold transition-colors ${
        selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
      } ${className}`}
    >
      {emoji && <span className="block text-2xl mb-1">{emoji}</span>}
      <span>{label}</span>
    </button>
  );
}
