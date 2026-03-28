'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task, getTask, updateTask, deleteTask } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Calendar, Clock, Zap, Brain, Trash2, Pencil, CheckCircle2,
  RefreshCw, Sparkles, Timer, ArrowLeft, ChevronRight,
  User, Users, Activity, TrendingUp, Shield, Copy, ExternalLink,
  MoreHorizontal, Check, X, Save, AlertOctagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import InitialAvatar from '@/components/InitialAvatar';

// ─── Config ──────────────────────────────────────────────────────────────────

const PRIORITY: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  high:   { label: 'High',   color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     dot: 'bg-red-400' },
  medium: { label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   dot: 'bg-amber-400' },
  low:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
};

const STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  pending:       { label: 'Pending',     color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   icon: RefreshCw },
  done:          { label: 'Completed',   color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/25',icon: CheckCircle2 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return 'Not set';
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1 bg-white/[0.05]" />
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{label}</span>
      <div className="h-px flex-1 bg-white/[0.05]" />
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 gap-4">
      <span className="text-[11px] font-semibold text-white/35 shrink-0">{label}</span>
      <div className="text-[12px] font-semibold text-white/75 text-right">{children}</div>
    </div>
  );
}

function ConfidenceGauge({ pct }: { pct: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444';
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = animated ? (pct / 100) * circ : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-28 w-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{pct}<span className="text-sm font-bold text-white/40">%</span></span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">AI Confidence</p>
        <p className="text-[11px] font-semibold mt-0.5" style={{ color }}>
          {pct >= 80 ? 'Very High' : pct >= 60 ? 'High' : pct >= 40 ? 'Moderate' : 'Low'}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [task, setTask]       = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<Partial<Task>>({});
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTask = useCallback(async () => {
    try {
      const res = await getTask(id as string);
      setTask(res);
    } catch {
      router.push('/tasks');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchTask(); }, [fetchTask]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e' && !editing) { e.preventDefault(); startEdit(); }
      if (e.key === 'Escape' && editing) { setEditing(false); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── Cancel confirm delete ─────────────────────────────────────────────────
  useEffect(() => {
    if (confirmDelete) {
      deleteTimerRef.current = setTimeout(() => setConfirmDelete(false), 4000);
    }
    return () => clearTimeout(deleteTimerRef.current);
  }, [confirmDelete]);

  // ── Actions ───────────────────────────────────────────────────────────────
  function startEdit() {
    if (!task) return;
    setForm({
      description: task.description,
      owner: task.owner,
      member: task.member,
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
      priority: task.priority,
      status: task.status,
      estimated_duration_hours: task.estimated_duration_hours,
    });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateTask(task!._id, { ...form, deadline: (form.deadline as string) || null });
      setTask(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    if (!task) return;
    setToggling(true);
    try {
      const next = task.status === 'done' ? 'pending' : 'done';
      const updated = await updateTask(task._id, { status: next });
      setTask(updated);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteTask(task!._id);
      router.push('/tasks');
    } finally {
      setDeleting(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
            <div className="absolute inset-2 rounded-xl border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Loading Task</p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const overdue     = !!(task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date());
  const meetingId   = typeof task.meeting === 'object' ? task.meeting?._id : task.meeting;
  const meetingTitle = typeof task.meeting === 'object' ? task.meeting?.title : null;
  const pri         = PRIORITY[task.priority] ?? PRIORITY.low;
  const sta         = STATUS[task.status]   ?? STATUS.pending;
  const StaIcon     = sta.icon;
  const confidencePct = Math.round((task.confidence ?? 0.8) * 100);
  const daysUntil   = task.deadline ? Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in content-container pt-2 pb-24">

      {/* ═══ BREADCRUMB ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2.5 h-9 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.14] text-white/50 hover:text-white/90 transition-all text-[11px] font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Tasks
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-white/15" />
        <span className="text-[11px] font-bold text-white/30 truncate max-w-xs">{task.description.slice(0, 40)}{task.description.length > 40 ? '…' : ''}</span>
        <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-white/20">
          <span className="hidden sm:block">⌘E to edit</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">

        {/* ═══ LEFT COLUMN ══════════════════════════════════════════════════ */}
        <div className="min-w-0 space-y-6">

          {/* ── HERO HEADER ─────────────────────────────────────────────── */}
          <div className={cn(
            'relative rounded-3xl border overflow-hidden transition-all duration-500',
            task.status === 'done'
              ? 'bg-emerald-950/20 border-emerald-500/15'
              : overdue
              ? 'bg-red-950/20 border-red-500/15'
              : 'bg-[oklch(0.14_0.02_240)] border-white/[0.07]'
          )}>
            {/* ambient glow */}
            <div className={cn(
              'absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none',
              task.status === 'done' ? 'bg-emerald-500' : overdue ? 'bg-red-500' : 'bg-primary'
            )} />

            <div className="relative p-7 md:p-10">
              {/* Status + Priority row */}
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                {/* Live status pill */}
                <div className={cn('inline-flex items-center gap-2 h-8 px-3.5 rounded-full border text-[11px] font-bold', sta.bg, sta.border, sta.color)}>
                  <StaIcon className={cn('h-3.5 w-3.5', task.status === 'in-progress' && 'animate-spin')} />
                  {sta.label}
                </div>

                <div className={cn('inline-flex items-center gap-2 h-8 px-3.5 rounded-full border text-[11px] font-bold', pri.bg, pri.border, pri.color)}>
                  <div className={cn('h-2 w-2 rounded-full', pri.dot, task.priority === 'high' && 'animate-pulse')} />
                  {pri.label} Priority
                </div>

                {overdue && (
                  <div className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-red-500/40 bg-red-500/15 text-red-400 text-[11px] font-bold animate-pulse">
                    <AlertOctagon className="h-3.5 w-3.5" />
                    Overdue
                  </div>
                )}

                {task.status === 'done' && (
                  <div className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </div>
                )}
              </div>

              {/* Title */}
              {editing ? (
                <Textarea
                  value={form.description as string}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="text-xl md:text-2xl font-bold bg-white/[0.05] border-white/10 rounded-2xl min-h-[80px] resize-none mb-6 focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              ) : (
                <h1 className="text-xl md:text-3xl font-bold text-white/95 leading-snug tracking-tight mb-6 pr-4">
                  {task.description}
                </h1>
              )}

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-3">
                {editing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="h-10 px-6 rounded-xl font-bold gap-2 text-[13px]"
                    >
                      {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      className="h-10 px-5 rounded-xl font-semibold gap-2 text-[13px] border-white/10 hover:bg-white/5"
                    >
                      <X className="h-4 w-4" /> Discard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleToggle}
                      disabled={toggling}
                      className={cn(
                        'h-10 px-6 rounded-xl font-bold gap-2 text-[13px]',
                        task.status === 'done' && 'bg-white/10 hover:bg-white/15 border border-white/10 text-white'
                      )}
                    >
                      {toggling
                        ? <RefreshCw className="h-4 w-4 animate-spin" />
                        : task.status === 'done'
                        ? <RefreshCw className="h-4 w-4" />
                        : <CheckCircle2 className="h-4 w-4" />}
                      {task.status === 'done' ? 'Reopen Task' : 'Mark Complete'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={startEdit}
                      className="h-10 px-5 rounded-xl font-semibold gap-2 text-[13px] border-white/10 hover:bg-white/5"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── TABS ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.06] w-fit">
            {(['details', 'activity'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'h-9 px-5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all',
                  activeTab === tab
                    ? 'bg-white/[0.09] text-white shadow-sm'
                    : 'text-white/35 hover:text-white/60'
                )}
              >
                {tab}
                {tab === 'activity' && task.agentMessages?.length > 0 && (
                  <span className="ml-2 h-4 w-4 inline-flex items-center justify-center rounded-full bg-purple-500/30 text-purple-300 text-[9px] font-black">{task.agentMessages.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── DETAILS TAB ──────────────────────────────────────────────── */}
          {activeTab === 'details' && (
            <div className="space-y-5">

              {/* People */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { role: 'Owner', name: task.owner, key: 'owner' as const, editing: editing },
                  { role: 'Member', name: task.member, key: 'member' as const, editing: editing },
                ].map(({ role, name, key }) => (
                  <div key={key} className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-3">{role}</p>
                    {editing ? (
                      <Input
                        value={(form as Record<string, string>)[key] ?? ''}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="h-9 text-[13px] bg-white/[0.05] border-white/10 rounded-xl"
                        placeholder={role}
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <InitialAvatar name={name || '?'} size="sm" />
                        <span className="text-[14px] font-semibold text-white/80">{name || 'Unassigned'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Attributes grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Deadline */}
                <div className={cn(
                  'p-5 rounded-2xl border transition-all',
                  overdue ? 'bg-red-500/[0.07] border-red-500/20' : 'bg-white/[0.03] border-white/[0.06]'
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('h-6 w-6 rounded-lg flex items-center justify-center', overdue ? 'bg-red-500/15' : 'bg-white/[0.06]')}>
                      <Calendar className={cn('h-3 w-3', overdue ? 'text-red-400' : 'text-white/40')} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Deadline</span>
                  </div>
                  {editing ? (
                    <Input type="date" value={form.deadline as string} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="h-8 text-xs bg-white/[0.05] border-white/10 rounded-lg" />
                  ) : (
                    <div>
                      <p className={cn('text-[13px] font-bold', overdue ? 'text-red-400' : 'text-white/75')}>{fmtDate(task.deadline)}</p>
                      {daysUntil !== null && task.status !== 'done' && (
                        <p className={cn('text-[10px] font-semibold mt-0.5', daysUntil < 0 ? 'text-red-400/70' : daysUntil <= 3 ? 'text-amber-400/70' : 'text-white/30')}>
                          {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Due today' : `${daysUntil}d left`}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <Timer className="h-3 w-3 text-white/40" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Est. Hours</span>
                  </div>
                  {editing ? (
                    <Input type="number" min={0.5} step={0.5} value={form.estimated_duration_hours as number} onChange={e => setForm(f => ({ ...f, estimated_duration_hours: parseFloat(e.target.value) }))} className="h-8 text-xs bg-white/[0.05] border-white/10 rounded-lg" />
                  ) : (
                    <p className="text-[13px] font-bold text-white/75">{task.estimated_duration_hours}h</p>
                  )}
                </div>

                {/* Priority */}
                <div className={cn('p-5 rounded-2xl border transition-all', pri.bg, pri.border)}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <TrendingUp className={cn('h-3 w-3', pri.color)} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Priority</span>
                  </div>
                  {editing ? (
                    <Select value={form.priority as string} onValueChange={v => setForm(f => ({ ...f, priority: v as Task['priority'] }))}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.05] border-white/10 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 bg-[oklch(0.12_0.02_240)]">
                        <SelectItem value="high">🔴 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', pri.dot, task.priority === 'high' && 'animate-pulse')} />
                      <p className={cn('text-[13px] font-bold', pri.color)}>{pri.label}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className={cn('p-5 rounded-2xl border transition-all', sta.bg, sta.border)}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <Activity className={cn('h-3 w-3', sta.color)} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Status</span>
                  </div>
                  {editing ? (
                    <Select value={form.status as string} onValueChange={v => setForm(f => ({ ...f, status: v as Task['status'] }))}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.05] border-white/10 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 bg-[oklch(0.12_0.02_240)]">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className={cn('text-[13px] font-bold', sta.color)}>{sta.label}</p>
                  )}
                </div>
              </div>

              {/* Source meeting */}
              {meetingTitle && (
                <div
                  onClick={() => router.push(`/meetings/${meetingId}`)}
                  className="group flex items-center justify-between p-5 rounded-2xl border border-orange-500/[0.12] bg-orange-500/[0.04] hover:border-orange-500/25 hover:bg-orange-500/[0.08] cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-orange-400/80" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-400/40 mb-1">Source Meeting</p>
                      <p className="text-[14px] font-semibold text-white/80 group-hover:text-orange-400 transition-colors">{meetingTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-orange-400/30 group-hover:text-orange-400 transition-all">
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVITY TAB ─────────────────────────────────────────────── */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {!task.agentMessages || task.agentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center mb-4">
                    <Sparkles className="h-7 w-7 text-purple-400/40" />
                  </div>
                  <p className="text-[13px] font-semibold text-white/25">No agent activity yet</p>
                  <p className="text-[11px] text-white/15 mt-1">The AI agent will log messages here as it processes this task.</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-purple-500/30 via-purple-500/10 to-transparent" />
                  <div className="space-y-4">
                    {task.agentMessages.map((msg, i) => (
                      <div key={i} className="group relative flex gap-5 pl-2">
                        {/* timeline dot */}
                        <div className="flex-shrink-0 relative z-10">
                          <div className="h-7 w-7 mt-0.5 rounded-lg bg-[oklch(0.13_0.02_240)] border border-purple-500/25 flex items-center justify-center shadow-lg shadow-purple-500/10 group-hover:border-purple-500/50 group-hover:scale-110 transition-all">
                            <Sparkles className="h-3.5 w-3.5 text-purple-400/70" />
                          </div>
                        </div>
                        {/* content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-3 mb-2.5">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/50">Agent Analysis</span>
                            <span className="text-[10px] text-white/20 font-medium">{timeAgo(msg.generatedAt)}</span>
                            {i === 0 && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400/70 border border-purple-500/20">Latest</span>
                            )}
                          </div>
                          <div className="p-5 rounded-2xl bg-purple-500/[0.04] border border-purple-500/[0.09] hover:bg-purple-500/[0.07] group-hover:border-purple-500/20 transition-all">
                            <p className="text-[13px] md:text-[14px] leading-relaxed text-white/70 italic">
                              &ldquo;{msg.message}&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ RIGHT SIDEBAR ════════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* Confidence gauge */}
          <div className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] flex flex-col items-center gap-2">
            <ConfidenceGauge pct={confidencePct} />
            <p className="text-[11px] text-center text-white/25 font-medium leading-relaxed max-w-[200px]">
              Neural-net extraction certainty score for this task
            </p>
          </div>

          {/* Quick status toggle */}
          <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">Quick Actions</p>
            <Button
              onClick={handleToggle}
              disabled={toggling}
              className={cn(
                'w-full h-11 rounded-xl font-bold gap-2.5 text-[13px] transition-all',
                task.status === 'done'
                  ? 'bg-white/[0.06] hover:bg-white/[0.10] text-white/60 border border-white/[0.08]'
                  : 'shadow-lg shadow-primary/20'
              )}
            >
              {toggling
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : task.status === 'done' ? <RefreshCw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {task.status === 'done' ? 'Reopen Task' : 'Mark Complete'}
            </Button>
            <Button
              variant="outline"
              onClick={startEdit}
              disabled={editing}
              className="w-full h-11 rounded-xl font-semibold gap-2.5 text-[13px] border-white/[0.09] hover:bg-white/[0.05]"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Task
            </Button>
          </div>

          {/* Metadata */}
          <div className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 mb-3">Metadata</p>
            <MetaRow label="Task ID">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px]">{task._id.slice(-8)}</span>
                <CopyButton value={task._id} />
              </div>
            </MetaRow>
            <MetaRow label="Created">
              {fmtDate(task.created_at)}
            </MetaRow>
            <MetaRow label="Est. Duration">
              {task.estimated_duration_hours}h
            </MetaRow>
            <MetaRow label="AI Confidence">
              <span className="font-bold text-primary">{confidencePct}%</span>
            </MetaRow>
            <MetaRow label="Integrity">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Verified</span>
              </span>
            </MetaRow>
          </div>

          {/* Danger zone */}
          <div className="p-5 rounded-2xl border border-red-500/[0.1] bg-red-500/[0.03]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400/30 mb-3">Danger Zone</p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                'w-full h-11 rounded-xl flex items-center justify-center gap-2.5 text-[12px] font-bold border transition-all',
                confirmDelete
                  ? 'bg-red-500/25 border-red-500/50 text-red-300 animate-pulse'
                  : 'bg-red-500/[0.07] border-red-500/[0.15] text-red-400/70 hover:bg-red-500/[0.15] hover:border-red-500/30 hover:text-red-400'
              )}
            >
              {deleting
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <Trash2 className="h-4 w-4" />}
              {deleting ? 'Deleting…' : confirmDelete ? 'Click again to confirm' : 'Delete Task'}
            </button>
            {confirmDelete && (
              <p className="text-[10px] text-red-400/50 text-center mt-2 font-semibold animate-pulse">
                This action is irreversible
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
