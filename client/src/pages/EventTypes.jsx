import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  Plus,
  Copy,
  Edit,
  Trash2,
  Clock,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  Search,
  ChevronDown,
  X,
  MoreVertical,
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

export default function EventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('event-types');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const { toast } = useToast();

  const fetchEventTypes = useCallback(async () => {
    try {
      const res = await api.get('/event-types');
      setEventTypes(res.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load event types', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (et) => {
    setForm({
      title: et.title,
      slug: et.slug,
      duration: String(et.duration),
      description: et.description || '',
      customQuestions: et.customQuestions || [],
    });
    setEditingId(et.id);
    setDialogOpen(true);
  };

  const handleTitleChange = (val) => {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === slugify(prev.title) || prev.slug === '' ? slugify(val) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: 'Validation error', description: 'Title and slug are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/event-types/${editingId}`, { ...form, duration: parseInt(form.duration, 10) });
        setEventTypes((prev) => prev.map((et) => et.id === editingId ? res.data : et));
        toast({ title: 'Event type updated', variant: 'success' });
      } else {
        const res = await api.post('/event-types', { ...form, duration: parseInt(form.duration, 10) });
        setEventTypes((prev) => [...prev, res.data]);
        toast({ title: 'Event type created', variant: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save event type',
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
      toast({ title: 'Event type deleted', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete event type', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: url, variant: 'success' });
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
      customQuestions: prev.customQuestions.map((q, i) => i === index ? { ...q, [field]: value } : q),
    }));
  };

  const filteredEventTypes = eventTypes.filter((et) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return et.title.toLowerCase().includes(query) || et.slug.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Scheduling</h1>
          </div>
          <Button className="h-11 rounded-full px-5 text-sm font-semibold" onClick={openCreate}>
            <Plus className="mr-2 h-5 w-5" />
            Create
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="border-t border-slate-200 px-5 sm:px-6">
          <div className="flex gap-8">
            {[
              { id: 'event-types', label: 'Event types' },
              { id: 'single-use', label: 'Single-use links' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-0 py-3 text-base font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'event-types' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search event types"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 rounded-xl border-slate-300 pl-12 text-sm"
            />
          </div>
        </div>
      )}



      {activeTab === 'single-use' && (
        loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : eventTypes.length === 0 ? (
          <Card className="rounded-2xl border border-slate-200 py-16 text-center shadow-sm">
            <CardContent>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <LinkIcon className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">No public booking links yet</h3>
              <p className="mb-4 text-sm text-slate-600">Create your first event type to generate public booking links.</p>
              <Button onClick={openCreate} className="h-11 rounded-full px-6 text-sm font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Create Event Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventTypes.map((et) => (
              <Card key={et.id} className="flex flex-col rounded-xl border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{et.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {et.duration} min
                      </div>
                    </div>
                    <Badge variant="secondary">{et.duration}m</Badge>
                  </div>
                  {et.description && (
                    <CardDescription className="mt-2 line-clamp-2">{et.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 rounded bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <LinkIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">/book/{et.slug}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => copyLink(et.slug)}>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/book/${et.slug}`, '_blank')}>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'event-types' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Left: Event Types List */}
          <div>
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEventTypes.length === 0 ? (
              <Card className="rounded-2xl border border-slate-200 py-16 text-center shadow-sm">
                <CardContent>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <LinkIcon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">
                    {searchTerm ? 'No matching event types' : 'No event types yet'}
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">
                    {searchTerm
                      ? 'Try another search term.'
                      : 'Create your first event type to start accepting bookings.'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={openCreate} className="h-11 rounded-full px-6 text-sm font-semibold">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event Type
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredEventTypes.map((et) => (
                  <button
                    key={et.id}
                    type="button"
                    onClick={() => setSelectedEventType(et)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                      selectedEventType?.id === et.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{et.title}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-3.5 w-3.5" />
                          {et.duration} min
                          {et.description && (
                            <>
                              <span>•</span>
                              <span className="line-clamp-1">{et.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">{et.duration}m</Badge>
                    </div>
                    {selectedEventType?.id === et.id && (
                      <div className="mt-3 flex items-center gap-2 rounded bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span className="truncate">/book/{et.slug}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Detail Panel */}
          {selectedEventType && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit lg:sticky lg:top-6">
              <div className="flex items-start justify-between gap-2 mb-6">
                <div>
                  <div className="mb-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedEventType.title}</h2>
                  {selectedEventType.description && (
                    <p className="mt-1 text-sm text-slate-600">{selectedEventType.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEventType(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 border-t border-slate-200 pt-5">
                {/* Duration */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">Duration</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    {selectedEventType.duration} min
                  </div>
                </div>

                {/* Booking Link */}
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">Booking Link</p>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <LinkIcon className="h-4 w-4 text-slate-600" />
                    <span className="truncate font-mono text-xs text-slate-600">/book/{selectedEventType.slug}</span>
                  </div>
                </div>

                {/* Custom Questions */}
                {selectedEventType.customQuestions?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">Custom Questions</p>
                    <div className="space-y-2">
                      {selectedEventType.customQuestions.map((q, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="text-slate-900">{q.question}</p>
                          {q.isRequired && <span className="text-xs text-gray-500">Required</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => copyLink(selectedEventType.slug)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(`/book/${selectedEventType.slug}`, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Landing Page
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => openEdit(selectedEventType)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setDeletingId(selectedEventType.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event Type' : 'Create Event Type'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update your event type details' : 'Set up a new scheduling link'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="e.g. 30 Minute Meeting"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/book/</span>
                <Input
                  placeholder="30-minute-meeting"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={form.duration} onValueChange={(v) => setForm((prev) => ({ ...prev, duration: v }))}>
                <SelectTrigger>
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
              <Label>Description</Label>
              <Input
                placeholder="Brief description of this meeting type"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Custom Questions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Questions</Label>
                <Button variant="outline" size="sm" onClick={addQuestion} type="button">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {form.customQuestions.map((q, index) => (
                <div key={index} className="flex items-center gap-2 border rounded p-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Question text"
                      value={q.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={q.isRequired}
                        onCheckedChange={(checked) => updateQuestion(index, 'isRequired', checked)}
                      />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event type? This action cannot be undone and will
              also remove all associated bookings.
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
