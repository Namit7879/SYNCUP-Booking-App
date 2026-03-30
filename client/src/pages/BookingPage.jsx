import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  format,
  isSameDay,
  isPast,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import BookingCalendar from '../components/booking/BookingCalendar';
import TimeSlotPicker from '../components/booking/TimeSlotPicker';
import {
  Clock,
  CalendarCheck,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Video,
  ArrowLeft,
  CalendarDays,
} from 'lucide-react';

export default function BookingPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [formData, setFormData] = useState({ name: '', email: '', guestEmails: '', answers: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ----------- Fetch Slots -----------
  const fetchSlots = useCallback(async (date) => {
    setLoadingSlots(true);
    setSlotsError(null);
    setSlots([]);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await api.get(`/bookings/slots/${slug}?date=${dateStr}`);
      const normalizedSlots = (res.data || []).map((slot) => {
        // Convert backend UTC times to local timezone
        const startTimeLocal = new Date(slot.startTime);
        const endTimeLocal = new Date(slot.endTime);
        return {
          ...slot,
          startTimeLocal,
          endTimeLocal,
          isAvailable: slot.isAvailable ?? true,
        };
      });
      setSlots(normalizedSlots);
    } catch {
      setSlotsError('Could not load time slots right now. Please try another date.');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [slug]);

  // ----------- Fetch Event Type -----------
  useEffect(() => {
    const fetchEventType = async () => {
      try {
        const res = await api.get(`/bookings/public/${slug}`);
        setEventType(res.data);
        if (res.data.customQuestions) {
          setFormData((prev) => ({
            ...prev,
            answers: res.data.customQuestions.map(() => ''),
          }));
        }
        const today = new Date();
        setSelectedDate(today);
        fetchSlots(today);
      } catch {
        setError('This booking link is no longer available or does not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventType();
  }, [slug, fetchSlots]);

  // ----------- Handlers -----------
  const handleDateSelect = (date) => {
    if (isPast(date) && !isSameDay(date, new Date())) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    setSubmitError(null);
    fetchSlots(date);
  };

  const handleSlotSelect = (slot) => {
    if (slot.isAvailable === false) return;
    setSelectedSlot(slot);
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (!selectedSlot) {
      setSubmitError('Please choose a time slot first.');
      return;
    }

    const requiredQuestionMissing = eventType.customQuestions?.some(
      (q, i) => q.isRequired && !(formData.answers[i] || '').trim()
    );

    if (requiredQuestionMissing) {
      setSubmitError('Please answer all required questions.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const guestEmailLine = formData.guestEmails.trim();
      const payload = {
        slug: eventType.slug,
        inviteeName: formData.name,
        inviteeEmail: formData.email,
        startTime: selectedSlot.startTime, // Keep UTC for backend
        notes: guestEmailLine ? `Guest emails: ${guestEmailLine}` : undefined,
        answers: eventType.customQuestions?.map((q, i) => ({
          question: q.question,
          answer: (formData.answers[i] || '').trim(),
        })) || [],
      };

      const res = await api.post('/bookings', payload);
      setConfirmation(res.data);
    } catch (requestError) {
      setSubmitError(requestError?.response?.data?.message || 'Failed to book meeting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------- Render Loading / Error / Confirmation -----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Link Not Found</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmation) {
    const startLocal = confirmation?.startTime ? new Date(confirmation.startTime) : null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f4f7] p-4">
        <Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking confirmed</h2>
            <p className="text-muted-foreground mb-6">A confirmation has been sent to {formData.email}</p>
            <div className="bg-muted rounded-lg p-4 text-left space-y-3">
              <div className="flex items-center gap-3">
                <CalendarCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">{eventType?.title}</span>
              </div>
              {startLocal && (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground w-16">Date:</span>
                    <span>{format(startLocal, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground w-16">Time:</span>
                    <span>{format(startLocal, 'h:mm a')}</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-16">With:</span>
                <span>{formData.name}</span>
              </div>
            </div>
            <Button className="mt-5 w-full" onClick={() => navigate('/')}>Done</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedStart = selectedSlot?.startTimeLocal || null;
  const selectedEnd = selectedSlot?.endTimeLocal || null;

  // ----------- Main Booking Page UI -----------
  return (
    <div className="min-h-screen bg-[#f2f4f7] p-3 sm:p-6">
      <div className="mx-auto w-full max-w-[1360px]">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="pointer-events-none absolute right-0 top-0 h-[130px] w-[130px] overflow-hidden rounded-tr-xl">
            <div className="absolute right-[-40px] top-[20px] rotate-45 bg-slate-600 px-10 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Powered by SyncUp
            </div>
          </div>

          <div className="grid lg:grid-cols-[330px_1fr]">
            <aside className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r lg:p-5">
              <button
                type="button"
                onClick={() => (selectedSlot ? setSelectedSlot(null) : navigate('/'))}
                className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-primary hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <p className="text-xl font-semibold text-slate-600">{eventType?.user?.name || 'Organizer'}</p>
              <h1 className="mt-1.5 text-3xl font-semibold leading-tight text-slate-900">{eventType?.title}</h1>

              <div className="mt-5 space-y-2.5 text-lg text-slate-600">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5" />
                  <span>{eventType?.duration} min</span>
                </div>
                <div className="flex items-start gap-3">
                  <Video className="mt-0.5 h-5 w-5" />
                  <span>Web conferencing details provided upon confirmation.</span>
                </div>
                {selectedStart && selectedEnd && (
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5" />
                    <span>{format(selectedStart, 'h:mm a')} - {format(selectedEnd, 'h:mm a')}, {format(selectedStart, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-5 w-5" />
                  <span>{timezone}</span>
                </div>
              </div>
            </aside>

            <section className="p-4 lg:p-5">
              {!selectedSlot ? (
                <>
                  <h2 className="text-3xl font-semibold text-slate-900">Select a Date & Time</h2>
                  <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_280px]">
                    <BookingCalendar
                      currentMonth={currentMonth}
                      selectedDate={selectedDate}
                      onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      onSelectDate={handleDateSelect}
                      disablePrevMonth={isSameMonth(currentMonth, new Date())}
                    />
                    <div>
                      {selectedDate ? (
                        <TimeSlotPicker
                          selectedDate={selectedDate}
                          slots={slots}
                          selectedSlot={selectedSlot}
                          loading={loadingSlots}
                          error={slotsError}
                          timezoneLabel={timezone}
                          onSelectSlot={handleSlotSelect}
                        />
                      ) : (
                        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                          <div>
                            <CalendarCheck className="mx-auto h-8 w-8 text-slate-400" />
                            <p className="mt-3 text-sm font-medium text-slate-700">Select a date to see available slots</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-[640px] space-y-3.5">
                  <h2 className="text-3xl font-semibold text-slate-900">Enter Details</h2>

                  {submitError && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      <span className="inline-flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {submitError}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="booking-name" className="text-sm font-semibold text-slate-800">Name *</Label>
                    <Input
                      id="booking-name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-10 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-email" className="text-sm font-semibold text-slate-800">Email *</Label>
                    <Input
                      id="booking-email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="h-10 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guest-emails" className="text-sm font-semibold text-slate-800">Guest Emails</Label>
                    <Input
                      id="guest-emails"
                      value={formData.guestEmails}
                      onChange={(e) => setFormData((prev) => ({ ...prev, guestEmails: e.target.value }))}
                      placeholder="guest1@example.com, guest2@example.com"
                      className="h-10 rounded-xl"
                    />
                  </div>

                  {eventType?.customQuestions?.map((q, i) => (
                    <div key={q.id || i} className="space-y-2">
                      <Label htmlFor={`question-${i}`} className="text-xl font-semibold text-slate-800">
                        {q.question} {q.isRequired && <span className="text-destructive">*</span>}
                      </Label>
                      <textarea
                        id={`question-${i}`}
                        placeholder="Your answer"
                        value={formData.answers[i] || ''}
                        onChange={(e) => {
                          const answers = [...formData.answers];
                          answers[i] = e.target.value;
                          setFormData((prev) => ({ ...prev, answers }));
                        }}
                        className="min-h-[120px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        required={q.isRequired}
                      />
                    </div>
                  ))}

                  <Button type="submit" className="mt-2 h-10 rounded-full px-5 text-sm font-semibold" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schedule Event
                  </Button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
