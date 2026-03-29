import { useState, useEffect, useCallback } from 'react';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Loader2,
  Mail,
  User,
} from 'lucide-react';
import { cn } from '../lib/utils';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const getCalendarDays = (monthDate) => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
};

const inDateRange = (date, start, end) => {
  if (!date) return false;
  const normalized = startOfDay(date);

  if (!start && !end) return true;
  if (start && !end) return isSameDay(normalized, startOfDay(start));

  const startDate = startOfDay(start);
  const endDate = startOfDay(end);

  if (isBefore(normalized, startDate)) return false;
  if (isAfter(normalized, endDate)) return false;
  return true;
};

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const [rangeMonth, setRangeMonth] = useState(new Date());
  const [appliedRange, setAppliedRange] = useState({ start: null, end: null });
  const [draftRange, setDraftRange] = useState({ start: null, end: null });
  const [cancelId, setCancelId] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      setMeetings(res.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load meetings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const now = new Date();

  const getMeetingDate = (m) => {
    const dateStr = m.startTime || m.date;
    if (!dateStr) return null;
    try { return parseISO(dateStr); } catch { return null; }
  };
  const upcoming = meetings.filter((m) => {
    const meetingDate = getMeetingDate(m);
    return meetingDate && meetingDate >= now && m.status !== 'CANCELLED';
  });
  const past = meetings.filter((m) => {
    const meetingDate = getMeetingDate(m);
    return !meetingDate || meetingDate < now || m.status === 'CANCELLED';
  });
  const rangeFiltered = meetings.filter((m) => {
    const meetingDate = getMeetingDate(m);
    return inDateRange(meetingDate, appliedRange.start, appliedRange.end);
  });

  const displayed = activeTab === 'upcoming'
    ? upcoming
    : activeTab === 'past'
      ? past
      : rangeFiltered;

  const rangeLabel = (() => {
    if (!appliedRange.start && !appliedRange.end) return 'All time';
    if (appliedRange.start && !appliedRange.end) return format(appliedRange.start, 'MMM d, yyyy');
    return `${format(appliedRange.start, 'MMM d')} - ${format(appliedRange.end, 'MMM d, yyyy')}`;
  })();

  const openDateRange = () => {
    setActiveTab('range');
    setDraftRange(appliedRange);
    setRangePickerOpen(true);
  };

  const handleRangeDaySelect = (day) => {
    const picked = startOfDay(day);

    if (!draftRange.start || (draftRange.start && draftRange.end)) {
      setDraftRange({ start: picked, end: null });
      return;
    }

    if (isBefore(picked, startOfDay(draftRange.start))) {
      setDraftRange({ start: picked, end: draftRange.start });
      return;
    }

    setDraftRange({ start: draftRange.start, end: picked });
  };

  const applyPreset = (preset) => {
    const today = startOfDay(new Date());

    if (preset === 'today') {
      setDraftRange({ start: today, end: today });
      return;
    }

    if (preset === 'week') {
      setDraftRange({
        start: startOfWeek(today, { weekStartsOn: 0 }),
        end: endOfWeek(today, { weekStartsOn: 0 }),
      });
      return;
    }

    if (preset === 'month') {
      setDraftRange({
        start: startOfMonth(today),
        end: endOfMonth(today),
      });
      return;
    }

    setDraftRange({ start: null, end: null });
  };

  const handleApplyRange = () => {
    setAppliedRange(draftRange);
    setActiveTab('range');
    setRangePickerOpen(false);
  };

  const handleCancelRange = () => {
    setDraftRange(appliedRange);
    setRangePickerOpen(false);
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${cancelId}/cancel`);
      setMeetings((prev) =>
        prev.map((m) => m.id === cancelId ? { ...m, status: 'CANCELLED' } : m)
      );
      toast({ title: 'Meeting cancelled', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel meeting', variant: 'destructive' });
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
      setCancelId(null);
    }
  };

  const getStatusBadge = (meeting) => {
    const meetingDate = getMeetingDate(meeting);
    if (meeting.status === 'CANCELLED') return <Badge variant="destructive">Cancelled</Badge>;
    if (!meetingDate || meetingDate < now) return <Badge variant="secondary">Completed</Badge>;
    return <Badge variant="success">Upcoming</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meetings</h1>
        <p className="text-muted-foreground mt-1">View and manage your scheduled meetings</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-1 border-b">
          <button
            onClick={() => {
              setActiveTab('upcoming');
              setRangePickerOpen(false);
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Upcoming
            <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">{upcoming.length}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('past');
              setRangePickerOpen(false);
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === 'past'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Past
            <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">{past.length}</span>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'range' && rangePickerOpen) {
                handleCancelRange();
              } else {
                openDateRange();
              }
            }}
            className={cn(
              'flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === 'range'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Date Range
            {activeTab === 'range' && rangePickerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {activeTab === 'range' && (
          <div className="text-sm text-muted-foreground">Selected: {rangeLabel}</div>
        )}

        {rangePickerOpen && (
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-5">
              <div className="flex flex-wrap gap-2 text-sm">
                <Button variant="ghost" size="sm" onClick={() => applyPreset('today')}>Today</Button>
                <Button variant="ghost" size="sm" onClick={() => applyPreset('week')}>This week</Button>
                <Button variant="ghost" size="sm" onClick={() => applyPreset('month')}>This month</Button>
                <Button variant="ghost" size="sm" onClick={() => applyPreset('all')}>All time</Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {[rangeMonth, addMonths(rangeMonth, 1)].map((monthDate) => (
                  <div key={monthDate.toISOString()} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-xl">{format(monthDate, 'MMMM yyyy')}</h3>
                      {isSameMonth(monthDate, rangeMonth) && (
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setRangeMonth(subMonths(rangeMonth, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setRangeMonth(addMonths(rangeMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground font-medium">
                      {WEEK_DAYS.map((dayName) => (
                        <div key={dayName} className="py-1">{dayName}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getCalendarDays(monthDate).map((day) => {
                        const isCurrentMonth = isSameMonth(day, monthDate);
                        const start = draftRange.start;
                        const end = draftRange.end;
                        const isStart = start && isSameDay(day, start);
                        const isEnd = end && isSameDay(day, end);
                        const isBetween =
                          start &&
                          end &&
                          !isBefore(day, startOfDay(start)) &&
                          !isAfter(day, startOfDay(end)) &&
                          !isStart &&
                          !isEnd;

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            disabled={!isCurrentMonth}
                            onClick={() => handleRangeDaySelect(day)}
                            className={cn(
                              'h-10 rounded-full text-sm transition-colors',
                              !isCurrentMonth && 'invisible',
                              isBetween && 'bg-primary/10 text-primary rounded-md',
                              (isStart || isEnd) && 'bg-primary text-primary-foreground',
                              isCurrentMonth && !isBetween && !isStart && !isEnd && 'hover:bg-muted'
                            )}
                          >
                            {format(day, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={handleCancelRange}>Cancel</Button>
                <Button onClick={handleApplyRange}>Apply</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No {activeTab === 'range' ? 'meetings in selected range' : `${activeTab} meetings`}</p>
          <p className="text-sm mt-1">
            {activeTab === 'upcoming'
              ? 'Share your booking link to start receiving meetings'
              : activeTab === 'past'
                ? 'Your past meetings will appear here'
                : 'Try selecting a wider date range'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((meeting) => {
            const startTime = getMeetingDate(meeting);
            const isUpcoming = startTime && startTime >= now && meeting.status !== 'CANCELLED';
            return (
              <Card key={meeting.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {meeting.eventType?.title || 'Meeting'}
                        </h3>
                        {getStatusBadge(meeting)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{meeting.inviteeName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{meeting.inviteeEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{startTime ? format(startTime, 'MMM d, yyyy') : '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{startTime ? format(startTime, 'h:mm a') : '—'}</span>
                        </div>
                      </div>
                    </div>
                    {isUpcoming && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
                        onClick={() => {
                          setCancelId(meeting.id);
                          setCancelDialogOpen(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this meeting? The invitee will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Meeting</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
