import { format, parseISO } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export default function TimeSlotPicker({
  selectedDate,
  slots,
  selectedSlot,
  loading,
  error,
  timezoneLabel,
  onSelectSlot,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{format(selectedDate, 'EEEE, MMM d')}</h3>
        {timezoneLabel && <p className="mt-1 text-xs text-slate-500">Times shown in {timezoneLabel}</p>}
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <Clock className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-700">No slots available</p>
          <p className="mt-1 text-xs text-slate-500">Please pick another date.</p>
        </div>
      ) : (
        <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
          {slots.map((slot) => {
            const disabled = slot.isAvailable === false;
            const selected = selectedSlot?.startTime === slot.startTime;

            return (
              <Button
                key={`${slot.startTime}-${slot.endTime}`}
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  'h-11 w-full rounded-xl border border-[#7db3ff] bg-white text-base font-semibold text-primary transition-colors',
                  'hover:bg-blue-50',
                  selected && 'border-primary bg-blue-50 text-primary'
                )}
              >
                {format(parseISO(slot.startTime), 'h:mm a')}
              </Button>
            );
          })}
        </div>
      )}
    </section>
  );
}
