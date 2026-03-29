import { cn } from '../../lib/utils';

const STEPS = [
  { id: 1, label: 'Select Date' },
  { id: 2, label: 'Select Time' },
  { id: 3, label: 'Enter Details' },
];

export default function BookingStepIndicator({ activeStep }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="grid grid-cols-3 gap-2 text-xs">
        {STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const isComplete = activeStep > step.id;

          return (
            <div
              key={step.id}
              className={cn(
                'rounded-md border px-2 py-2 text-center font-medium transition-colors',
                isActive && 'border-primary bg-primary/10 text-primary',
                isComplete && 'border-green-200 bg-green-50 text-green-700',
                !isActive && !isComplete && 'border-slate-200 text-slate-500'
              )}
            >
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
