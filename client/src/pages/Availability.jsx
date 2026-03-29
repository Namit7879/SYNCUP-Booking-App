import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CalendarDays, Copy, Loader2, Plus, RefreshCcw, Save, X } from 'lucide-react';

// dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const DAYS = [
  { key: 'sunday', label: 'Sunday', shortLabel: 'S', dayOfWeek: 0 },
  { key: 'monday', label: 'Monday', shortLabel: 'M', dayOfWeek: 1 },
  { key: 'tuesday', label: 'Tuesday', shortLabel: 'T', dayOfWeek: 2 },
  { key: 'wednesday', label: 'Wednesday', shortLabel: 'W', dayOfWeek: 3 },
  { key: 'thursday', label: 'Thursday', shortLabel: 'T', dayOfWeek: 4 },
  { key: 'friday', label: 'Friday', shortLabel: 'F', dayOfWeek: 5 },
  { key: 'saturday', label: 'Saturday', shortLabel: 'S', dayOfWeek: 6 },
];

const defaultDay = (dayOfWeek) => ({
  isAvailable: dayOfWeek >= 1 && dayOfWeek <= 5,
  startTime: '09:00',
  endTime: '17:00',
});

const buildDefaultAvailability = () =>
  Object.fromEntries(DAYS.map(({ key, dayOfWeek }) => [key, defaultDay(dayOfWeek)]));

const createLocalDateSpecificRow = () => ({
  id: `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  date: '',
  startTime: '09:00',
  endTime: '17:00',
});

const getDayKeyFromDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const day = DAYS.find((entry) => entry.dayOfWeek === date.getDay());
  return day?.key ?? null;
};

const isDateOverrideChanged = (row, weeklyAvailability) => {
  const dayKey = getDayKeyFromDate(row.date);
  if (!dayKey) return Boolean(row.date);

  const weekly = weeklyAvailability[dayKey];
  if (!weekly) return true;

  return (
    !weekly.isAvailable ||
    weekly.startTime !== row.startTime ||
    weekly.endTime !== row.endTime
  );
};

export default function Availability() {
  const [availability, setAvailability] = useState(buildDefaultAvailability);
  const [bufferBefore, setBufferBefore] = useState('0');
  const [bufferAfter, setBufferAfter] = useState('0');
  const [eventTypeCount, setEventTypeCount] = useState(0);
  const [dateSpecificHours, setDateSpecificHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchAvailability = useCallback(async () => {
    try {
      const [availRes, bufferRes, eventTypesRes, overridesRes] = await Promise.all([
        api.get('/availability'),
        api.get('/buffer-time'),
        api.get('/event-types'),
        api.get('/availability/date-overrides'),
      ]);

      const avail = buildDefaultAvailability();
      if (Array.isArray(availRes.data)) {
        availRes.data.forEach((record) => {
          const day = DAYS.find((d) => d.dayOfWeek === record.dayOfWeek);
          if (day) {
            avail[day.key] = {
              isAvailable: record.isAvailable,
              startTime: record.startTime,
              endTime: record.endTime,
            };
          }
        });
      }
      setAvailability(avail);

      if (bufferRes.data) {
        setBufferBefore(String(bufferRes.data.beforeMinutes ?? 0));
        setBufferAfter(String(bufferRes.data.afterMinutes ?? 0));
      }

      setEventTypeCount(Array.isArray(eventTypesRes.data) ? eventTypesRes.data.length : 0);

      setDateSpecificHours(
        Array.isArray(overridesRes.data)
          ? overridesRes.data.map((row) => ({
              id: row.id,
              date: typeof row.date === 'string' ? row.date.split('T')[0] : '',
              startTime: row.startTime,
              endTime: row.endTime,
            }))
          : []
      );
    } catch {
      toast({
        title: 'Could not load complete availability data',
        description: 'Using defaults where needed.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const updateDay = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const addDateSpecificHour = () => {
    setDateSpecificHours((prev) => [...prev, createLocalDateSpecificRow()]);
  };

  const updateDateSpecificHour = (id, field, value) => {
    setDateSpecificHours((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeDateSpecificHour = async (id) => {
    setDateSpecificHours((prev) => prev.filter((row) => row.id !== id));

    if (!id.startsWith('tmp-')) {
      try {
        await api.delete(`/availability/date-overrides/${id}`);
        toast({ title: 'Date-specific hour removed', variant: 'success' });
      } catch {
        toast({
          title: 'Could not remove date-specific hour',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slots = DAYS.map(({ key, dayOfWeek }) => ({
        dayOfWeek,
        startTime: availability[key].startTime,
        endTime: availability[key].endTime,
        isAvailable: availability[key].isAvailable,
      }));

      const validOverrides = dateSpecificHours
        .filter((row) => row.date)
        .map((row) => ({
          date: row.date,
          startTime: row.startTime,
          endTime: row.endTime,
          isAvailable: true,
        }));

      await Promise.all([
        api.post('/availability', slots),
        api.post('/buffer-time', {
          beforeMinutes: parseInt(bufferBefore, 10),
          afterMinutes: parseInt(bufferAfter, 10),
        }),
        api.post('/availability/date-overrides', validOverrides),
      ]);

      await fetchAvailability();
      toast({ title: 'Availability saved!', description: 'Weekly and date-specific hours are updated.', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save availability',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="mt-1 text-muted-foreground">Set when you are typically available for meetings</p>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Active on:{' '}
            <span className="font-medium text-foreground">
              {eventTypeCount} event type{eventTypeCount === 1 ? '' : 's'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Weekly hours
            </CardTitle>
            <CardDescription>Set when you are typically available for meetings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map(({ key, label, shortLabel }) => {
              const day = availability[key];

              return (
                <div key={key} className="flex flex-wrap items-center gap-3 rounded-lg p-1">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                    onClick={() => updateDay(key, 'isAvailable', !day.isAvailable)}
                    aria-label={`Toggle ${label} availability`}
                  >
                    {shortLabel}
                  </button>

                  {day.isAvailable ? (
                    <>
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDay(key, 'startTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDay(key, 'endTime', e.target.value)}
                        className="w-32"
                      />

                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        onClick={() => updateDay(key, 'isAvailable', false)}
                        aria-label={`Mark ${label} unavailable`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        title="Multiple ranges are not enabled yet"
                        aria-label="Add additional range"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        onClick={() => {
                          navigator.clipboard.writeText(`${day.startTime} - ${day.endTime}`);
                          toast({ title: `${label} hours copied`, variant: 'success' });
                        }}
                        aria-label={`Copy ${label} hours`}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-20 text-sm text-muted-foreground">Unavailable</span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                        onClick={() => updateDay(key, 'isAvailable', true)}
                        aria-label={`Set ${label} available`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date-specific hours
              </CardTitle>
              <CardDescription>Adjust hours for specific days</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addDateSpecificHour}>
              <Plus className="mr-1 h-4 w-4" />
              Hours
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {dateSpecificHours.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No date-specific hours added yet.
              </div>
            ) : (
              dateSpecificHours.map((row) => (
                <div
                  key={row.id}
                  className={`grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center ${
                    isDateOverrideChanged(row, availability)
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <Input
                    type="date"
                    value={row.date}
                    onChange={(e) => updateDateSpecificHour(row.id, 'date', e.target.value)}
                  />
                  <Input
                    type="time"
                    value={row.startTime}
                    onChange={(e) => updateDateSpecificHour(row.id, 'startTime', e.target.value)}
                    className="w-32"
                  />
                  <Input
                    type="time"
                    value={row.endTime}
                    onChange={(e) => updateDateSpecificHour(row.id, 'endTime', e.target.value)}
                    className="w-32"
                  />
                  <div className="flex items-center justify-start sm:justify-center">
                    {isDateOverrideChanged(row, availability) ? (
                      <Badge variant="default">Changed</Badge>
                    ) : (
                      <Badge variant="secondary">Same as weekly</Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDateSpecificHour(row.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}

            <p className="text-xs text-muted-foreground">
              Date-specific hours are saved and override weekly hours for selected dates.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buffer Time</CardTitle>
          <CardDescription>Add spacing before and after meetings</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Before Meeting</Label>
            <Select value={bufferBefore} onValueChange={setBufferBefore}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No buffer</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>After Meeting</Label>
            <Select value={bufferAfter} onValueChange={setBufferAfter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No buffer</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Availability
      </Button>
    </div>
  );
}
