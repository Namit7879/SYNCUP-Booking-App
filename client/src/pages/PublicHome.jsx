import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ArrowRight,
  Loader2,
  CalendarDays,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

function getHostName(eventTypes) {
  if (!Array.isArray(eventTypes) || eventTypes.length === 0) return 'Organizer';
  return eventTypes[0]?.user?.name || 'Organizer';
}

export default function PublicHome() {
  const navigate = useNavigate();
  const [publicEventTypes, setPublicEventTypes] = useState([]);
  const [loadingEventTypes, setLoadingEventTypes] = useState(true);
  const [publicLinksError, setPublicLinksError] = useState(false);

  useEffect(() => {
    const fetchPublicEventTypes = async () => {
      setLoadingEventTypes(true);
      try {
        const res = await api.get('/bookings/public-event-types');
        setPublicEventTypes(Array.isArray(res.data) ? res.data : []);
        setPublicLinksError(false);
      } catch {
        setPublicEventTypes([]);
        setPublicLinksError(true);
      } finally {
        setLoadingEventTypes(false);
      }
    };

    fetchPublicEventTypes();
  }, []);

  const hostName = useMemo(() => getHostName(publicEventTypes), [publicEventTypes]);

  return (
    <div className="min-h-screen bg-[#f2f4f7] p-3 sm:p-6">
      <div className="relative mx-auto w-full max-w-[1360px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
          <Button
            variant="outline"
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            onClick={() => navigate('/login')}
          >
            Admin Login
          </Button>
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-[130px] w-[130px] overflow-hidden rounded-tr-xl">
          <div className="absolute right-[-40px] top-[20px] rotate-45 bg-slate-600 px-10 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Powered by SyncUp
          </div>
        </div>

        <div className="px-5 pb-8 pt-12 sm:px-12 sm:pt-14">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-2xl font-semibold text-slate-700 sm:text-3xl">{hostName}</p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Welcome to my scheduling page. Please select an event to continue.
            </p>
          </div>

          <section className="mx-auto mt-8 max-w-5xl space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 inline-flex rounded-lg bg-slate-100 p-2">
                  <CalendarDays className="h-4 w-4 text-slate-700" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Pick a date</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">Select your preferred day from available dates.</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 inline-flex rounded-lg bg-slate-100 p-2">
                  <Clock className="h-4 w-4 text-slate-700" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Choose a time</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">Only available slots are shown for faster booking.</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 inline-flex rounded-lg bg-slate-100 p-2">
                  <ShieldCheck className="h-4 w-4 text-slate-700" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Confirm details</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">Enter contact details and confirm in seconds.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Why this page is useful</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  Public link can be shared instantly
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  Mobile-friendly booking flow
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  Real-time available slots only
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  Clear step-by-step scheduling
                </div>
              </div>
            </div>
          </section>

          <div className="mt-10 border-t border-slate-200 pt-8">
            {loadingEventTypes ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : publicLinksError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Unable to load public links. Check backend status and database configuration.
              </div>
            ) : publicEventTypes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-lg text-slate-700">No active event types yet.</p>
                <Button className="mt-5" onClick={() => navigate('/login')}>
                  Go to Admin
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {publicEventTypes.map((eventType) => (
                  <button
                    key={eventType.id}
                    type="button"
                    onClick={() => navigate(`/book/${eventType.slug}`)}
                    className="group flex min-h-[180px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 inline-block h-4 w-4 rounded-full bg-violet-500" />
                        <div>
                          <p className="text-xl font-semibold text-slate-900">{eventType.title}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {eventType.duration} min
                            {eventType.description ? ` • ${eventType.description}` : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:text-slate-700" />
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Event link
                      </span>
                      <span className="inline-flex items-center gap-2 font-mono text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        /book/{eventType.slug}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
