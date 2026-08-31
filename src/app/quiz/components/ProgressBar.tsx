interface ProgressBarProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
}

export default function ProgressBar({ step, totalSteps, onBack }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-gray-500">
          Step {step} of {totalSteps}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
