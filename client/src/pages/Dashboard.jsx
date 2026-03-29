import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import {
  CalendarDays,
  Clock,
  Plus,
  Copy,
  Edit3,
  Trash2,
  ExternalLink,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';

const defaultForm = {
  title: '',
  slug: '',
  duration: '30',
  description: '',
  customQuestions: [],
};

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventTypes, setEventTypes] = useState([]);
  const [publicEventTypes, setPublicEventTypes] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPublicLinks, setLoadingPublicLinks] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchPublicEventTypes = useCallback(async () => {
    try {
      const res = await api.get('/bookings/public-event-types');
      setPublicEventTypes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPublicEventTypes([]);
    } finally {
      setLoadingPublicLinks(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [eventTypesRes, meetingsRes] = await Promise.all([
        api.get('/event-types'),
        api.get('/bookings/upcoming'),
      ]);
      setEventTypes(eventTypesRes.data || []);
      setUpcomingMeetings(meetingsRes.data?.length || 0);
    } catch {
      toast({
        title: 'Unable to load dashboard',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
    fetchPublicEventTypes();
  }, [fetchDashboardData, fetchPublicEventTypes]);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (eventType) => {
    setForm({
      title: eventType.title,
      slug: eventType.slug,
      duration: String(eventType.duration),
      description: eventType.description || '',
      customQuestions: eventType.customQuestions || [],
    });
    setEditingId(eventType.id);
    setDialogOpen(true);
  };

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug === slugify(prev.title) || prev.slug === '' ? slugify(value) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({
        title: 'Validation error',
        description: 'Title and slug are required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/event-types/${editingId}`, {
          ...form,
          duration: parseInt(form.duration, 10),
        });
        setEventTypes((prev) => prev.map((et) => (et.id === editingId ? res.data : et)));
        toast({ title: 'Event updated', variant: 'success' });
      } else {
        const res = await api.post('/event-types', {
          ...form,
          duration: parseInt(form.duration, 10),
        });
        setEventTypes((prev) => [res.data, ...prev]);
        toast({ title: 'Event created', variant: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Unable to save event',
        description: error.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/event-types/${deletingId}`);
      setEventTypes((prev) => prev.filter((et) => et.id !== deletingId));
      toast({ title: 'Event deleted', variant: 'success' });
    } catch {
      toast({
        title: 'Unable to delete event',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Booking link copied',
      description: url,
      variant: 'success',
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      customQuestions: [...prev.customQuestions, { question: '', isRequired: false }],
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Event Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage scheduling links from one clean workspace.
            </p>
          </div>
          <Button className="h-11 rounded-lg px-5 text-sm font-semibold shadow-sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Event Types</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {loading ? '-' : eventTypes.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active scheduling links in your account.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Meetings</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {loading ? '-' : upcomingMeetings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Meetings currently scheduled ahead.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-white shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardDescription>Quick Access</CardDescription>
            <CardTitle className="text-lg font-bold tracking-tight">Public Booking Links</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPublicLinks ? (
              <p className="text-sm text-muted-foreground">Loading links...</p>
            ) : publicEventTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No public booking links yet.</p>
            ) : (
              <div className="space-y-2">
                {publicEventTypes.slice(0, 3).map((eventType) => (
                  <button
                    key={eventType.id}
                    type="button"
                    onClick={() => navigate(`/book/${eventType.slug}`)}
                    className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition-all hover:border-primary hover:bg-white hover:shadow-sm"
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-primary">{eventType.title}</p>
                      <p className="text-xs text-slate-500">/book/{eventType.slug}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                  </button>
                ))}
                {publicEventTypes.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{publicEventTypes.length - 3} more</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Event Types</h2>
          <Badge variant="secondary" className="rounded-md bg-slate-100 text-slate-700">
            {eventTypes.length} total
          </Badge>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : eventTypes.length === 0 ? (
          <Card className="rounded-2xl border bg-white shadow-sm">
            <CardContent className="flex min-h-[240px] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-3">
                <CalendarDays className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold">No event types yet</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Start by creating your first event type to share a public booking link.
              </p>
              <Button className="mt-5 rounded-lg" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {eventTypes.map((eventType) => (
              <Card
                key={eventType.id}
                className="rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="line-clamp-1 text-base font-bold tracking-tight">
                        {eventType.title}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{eventType.duration} min</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-md">{eventType.duration}m</Badge>
                  </div>

                  <CardDescription className="line-clamp-2 min-h-10 text-sm">
                    {eventType.description || 'No description added.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="rounded-lg border bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                    /book/{eventType.slug}
                  </div>
                  {eventType.customQuestions?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {eventType.customQuestions.length} custom question
                      {eventType.customQuestions.length > 1 ? 's' : ''}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => copyLink(eventType.slug)}
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => window.open(`/book/${eventType.slug}`, '_blank')}
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => openEdit(eventType)}
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setDeletingId(eventType.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription>
              Configure a public scheduling link with custom intake questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                placeholder="30 Minute Intro Call"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-duration">Duration</Label>
              <Select
                value={form.duration}
                onValueChange={(value) => setForm((prev) => ({ ...prev, duration: value }))}
              >
                <SelectTrigger id="event-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-slug">Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/book/</span>
                <Input
                  id="event-slug"
                  placeholder="intro-call"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Input
                id="event-description"
                placeholder="Share context for invitees"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Custom Questions</Label>
                <Button variant="outline" size="sm" type="button" onClick={addQuestion}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Question
                </Button>
              </div>

              {form.customQuestions.length === 0 && (
                <div className="rounded-lg border border-dashed bg-slate-50 px-3 py-4 text-sm text-muted-foreground">
                  No custom questions added yet.
                </div>
              )}

              {form.customQuestions.map((question, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter your question"
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Switch
                          checked={question.isRequired}
                          onCheckedChange={(checked) => updateQuestion(index, 'isRequired', checked)}
                        />
                        Required question
                      </div>
                      <Button
                        variant="ghost"
                        type="button"
                        className="h-8 px-2 text-destructive"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Save Changes' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Event Type</DialogTitle>
            <DialogDescription>
              This will remove the event type and all associated bookings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
