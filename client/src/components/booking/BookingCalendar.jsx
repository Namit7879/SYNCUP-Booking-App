import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isPast,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const getCalendarDays = (monthDate) => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calStart, end: calEnd });
};

export default function BookingCalendar({
  currentMonth,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  disablePrevMonth,
}) {
  const today = new Date();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between md:mb-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          disabled={disablePrevMonth}
          aria-label="Previous month"
          className="h-9 w-9 rounded-full border border-transparent text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-xl font-semibold tracking-tight text-slate-800">{format(currentMonth, 'MMMM yyyy')}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
          className="h-9 w-9 rounded-full border border-transparent text-slate-500 hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="pb-1 text-center text-xs font-semibold tracking-wide text-slate-500">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-2">
        {getCalendarDays(currentMonth).map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const isPastDay = isPast(day) && !isToday;
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPastDay || !isCurrentMonth}
              onClick={() => onSelectDate(day)}
              className={cn(
                'aspect-square rounded-full text-base font-medium transition-all',
                !isCurrentMonth && 'invisible',
                isPastDay && 'cursor-not-allowed text-slate-300',
                !isPastDay && isCurrentMonth && 'text-slate-600 hover:bg-slate-100',
                isToday && !isSelected && 'bg-slate-100 text-slate-900',
                isSelected && 'bg-primary text-white shadow-sm'
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </section>
  );
}
