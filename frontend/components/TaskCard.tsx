'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, updateTask, deleteTask } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, Clock, User, Users, Zap, Brain, Trash2, CheckCircle2, RefreshCw,
  ArrowRight, Tag, AlertTriangle, Target, Layers, Shield, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import InitialAvatar from '@/components/InitialAvatar';

interface Props {
  task: Task;
  onUpdate: (updated: Task) => void;
  onDelete: (id: string) => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  high:   { label: 'High',   dot: 'bg-red-400',     cls: 'bg-red-500/10 text-red-400 border-red-500/25', pulse: true },
  medium: { label: 'Medium', dot: 'bg-amber-400',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25', pulse: false },
  low:    { label: 'Low',    dot: 'bg-emerald-400', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', pulse: false },
};

const STATUS_CFG = {
  pending:       { label: 'Pending',     cls: 'bg-purple-500/10 text-purple-400 border-purple-500/25' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
  done:          { label: 'Done',        cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
};

const RISK_CFG = {
  low:      { label: 'Low Risk',      cls: 'text-emerald-400' },
  medium:   { label: 'Med Risk',      cls: 'text-amber-400' },
  high:     { label: 'High Risk',     cls: 'text-orange-400' },
  critical: { label: 'Critical Risk', cls: 'text-red-400' },
};

const EFFORT_CFG = {
  trivial: { label: 'Trivial', bars: 1 },
  small:   { label: 'Small',   bars: 2 },
  medium:  { label: 'Medium',  bars: 3 },
  large:   { label: 'Large',   bars: 4 },
  epic:    { label: 'Epic',    bars: 5 },
};

const ACTION_TYPE_ICONS: Record<string, string> = {
  build: '🔨', research: '🔍', review: '👁️', design: '🎨',
  test: '🧪', fix: '🔧', deploy: '🚀', communicate: '💬',
  plan: '📋', hire: '👥', document: '📝', 'follow-up': '📞', other: '⚡',
};

const CATEGORY_COLORS: Record<string, string> = {
  engineering: 'text-blue-400', design: 'text-purple-400', marketing: 'text-pink-400',
  product: 'text-cyan-400', operations: 'text-amber-400', hr: 'text-green-400',
  finance: 'text-emerald-400', research: 'text-violet-400', qa: 'text-orange-400',
  devops: 'text-indigo-400', leadership: 'text-yellow-400', general: 'text-slate-400',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function TaskCard({ task, onUpdate, onDelete }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const overdue = !!(task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date());
  const meetingTitle = typeof task.meeting === 'object' ? task.meeting?.title : null;
  const priority = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG.low;
  const status   = STATUS_CFG[task.status]   ?? STATUS_CFG.pending;
  const riskCfg  = RISK_CFG[task.risk_level ?? 'low'];
  const effortCfg = EFFORT_CFG[task.effort_level ?? 'small'];
  const confidencePct = Math.round((task.confidence ?? 0.8) * 100);
  const categoryColor = CATEGORY_COLORS[task.category ?? 'general'] || 'text-slate-400';
  const actionIcon = ACTION_TYPE_ICONS[task.action_type ?? 'other'] || '⚡';

  const daysUntil = task.deadline
    ? Math.ceil((new Date(task.deadline).getTime() - Date.now()) / 86400000)
    : null;

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setToggling(true);
    try {
      const next = task.status === 'done' ? 'pending' : 'done';
      const updated = await updateTask(task._id, { status: next });
      onUpdate(updated);
    } finally { setToggling(false); }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await deleteTask(task._id);
      onDelete(task._id);
    } catch { setDeleting(false); }
  }

  return (
    <div
      onClick={() => router.push(`/tasks/${task._id}`)}
      className={cn(
        'group relative flex flex-col rounded-2xl cursor-pointer overflow-hidden',
        'bg-[oklch(0.14_0.02_240)]',
        'border transition-all duration-300',
        'hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5',
        overdue
          ? 'border-red-500/30 shadow-red-500/5 shadow-md'
          : task.status === 'done'
          ? 'border-emerald-500/20 opacity-80'
          : 'border-white/[0.07] hover:border-primary/20'
      )}
    >
      {/* Overdue left accent */}
      {overdue && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-red-500/70 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
      )}

      {/* Top shimmer on hover */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        {/* Category + Action Type */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{actionIcon}</span>
            <span className={cn('text-[10px] font-bold uppercase tracking-widest', categoryColor)}>
              {task.category || 'general'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Priority + Status badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border', priority.cls)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', priority.dot, priority.pulse && 'animate-pulse')} />
            {priority.label}
          </span>
          <span className={cn('inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border', status.cls)}>
            {status.label}
          </span>
          {overdue && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/25 animate-pulse">
              <AlertTriangle className="h-2.5 w-2.5" />
              Overdue
            </span>
          )}
        </div>

        {/* Task description */}
        <p className="text-[13px] font-semibold leading-relaxed text-white/85 group-hover:text-white transition-colors line-clamp-2">
          {task.description}
        </p>

        {/* Context snippet */}
        {task.context && (
          <p className="text-[11px] leading-relaxed text-white/35 mt-1.5 line-clamp-1 italic">
            {task.context}
          </p>
        )}
      </div>

      {/* ─── DIVIDER ─────────────────────────────────────────────────────── */}
      <div className="h-px bg-white/[0.05] mx-5" />

      {/* ─── BODY ───────────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 flex flex-col gap-3 flex-1 mt-3">

        {/* People Row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <InitialAvatar name={task.owner || '?'} size="sm" />
            <span className="text-[11px] font-medium text-white/55 truncate">{task.owner || 'Unassigned'}</span>
          </div>
          {task.member && task.member !== task.owner && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 min-w-0">
                <InitialAvatar name={task.member} size="sm" />
                <span className="text-[11px] font-medium text-white/55 truncate">{task.member}</span>
              </div>
            </>
          )}
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Deadline */}
          <div className={cn('flex flex-col gap-0.5 px-2.5 py-2 rounded-xl border', overdue ? 'bg-red-500/[0.08] border-red-500/20' : 'bg-white/[0.03] border-white/[0.06]')}>
            <span className="text-[8px] font-black uppercase tracking-wider text-white/20">Deadline</span>
            {task.deadline ? (
              <span className={cn('text-[10px] font-bold', overdue ? 'text-red-400' : 'text-white/60')}>
                {daysUntil !== null && task.status !== 'done'
                  ? daysUntil < 0 ? `${Math.abs(daysUntil)}d ago`
                  : daysUntil === 0 ? 'Today'
                  : `${daysUntil}d left`
                  : new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                }
              </span>
            ) : (
              <span className="text-[10px] font-medium text-white/25">Not set</span>
            )}
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-0.5 px-2.5 py-2 rounded-xl border bg-white/[0.03] border-white/[0.06]">
            <span className="text-[8px] font-black uppercase tracking-wider text-white/20">Est.</span>
            <span className="text-[10px] font-bold text-white/60">{task.estimated_duration_hours}h</span>
          </div>

          {/* Risk */}
          <div className={cn('flex flex-col gap-0.5 px-2.5 py-2 rounded-xl border bg-white/[0.03] border-white/[0.06]')}>
            <span className="text-[8px] font-black uppercase tracking-wider text-white/20">Risk</span>
            <span className={cn('text-[10px] font-bold', riskCfg.cls)}>{riskCfg.label.split(' ')[0]}</span>
          </div>
        </div>

        {/* Effort bars + Confidence */}
        <div className="flex items-center justify-between gap-3">
          {/* Effort level bars */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-black uppercase tracking-wider text-white/20 mr-1">Effort</span>
            {[1,2,3,4,5].map(n => (
              <div
                key={n}
                className={cn(
                  'h-2.5 w-1.5 rounded-sm transition-all',
                  n <= effortCfg.bars
                    ? task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                    : 'bg-white/[0.08]'
                )}
              />
            ))}
            <span className="text-[9px] text-white/30 ml-1">{effortCfg.label}</span>
          </div>

          {/* Confidence mini */}
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black uppercase tracking-wider text-white/20">AI</span>
            <div className="h-1.5 w-14 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={cn('h-full rounded-full', confidencePct >= 80 ? 'bg-emerald-400' : confidencePct >= 60 ? 'bg-blue-400' : 'bg-amber-400')}
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span className={cn('text-[9px] font-bold', confidencePct >= 80 ? 'text-emerald-400' : confidencePct >= 60 ? 'text-blue-400' : 'text-amber-400')}>
              {confidencePct}%
            </span>
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 4).map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-white/40">
                <Tag className="h-2 w-2" />
                {tag}
              </span>
            ))}
            {task.tags.length > 4 && (
              <span className="text-[9px] text-white/25 font-medium">+{task.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Success criteria snippet */}
        {task.success_criteria && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/[0.1]">
            <Target className="h-3 w-3 text-emerald-400/60 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-relaxed text-white/50 line-clamp-1">{task.success_criteria}</p>
          </div>
        )}

        {/* Blockers indicator */}
        {task.blockers && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-orange-500/[0.05] border border-orange-500/[0.12]">
            <Shield className="h-3 w-3 text-orange-400/70 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-relaxed text-orange-300/60 line-clamp-1">{task.blockers}</p>
          </div>
        )}

        {/* Agent note */}
        {task.agentMessages && task.agentMessages.length > 0 && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-primary/[0.05] border border-primary/10">
            <Brain className="h-3 w-3 text-primary/60 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-relaxed text-white/50 italic line-clamp-1">
              &ldquo;{task.agentMessages[task.agentMessages.length - 1].message}&rdquo;
            </p>
          </div>
        )}

        {/* Meeting source */}
        {meetingTitle && (
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-white/25">
            <BookOpen className="h-2.5 w-2.5" />
            <span className="truncate">{meetingTitle}</span>
          </div>
        )}

        {/* ─── FOOTER ────────────────────────────────────────────────── */}
        <div className="flex gap-2 pt-1 mt-auto" onClick={e => e.stopPropagation()}>
          <Button
            variant={task.status === 'done' ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggle}
            disabled={toggling}
            className="flex-1 gap-1.5 text-[11px] font-bold uppercase tracking-wider h-8 rounded-xl"
          >
            {toggling
              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              : task.status === 'done'
              ? <><RefreshCw className="h-3.5 w-3.5" /> Reopen</>
              : <><CheckCircle2 className="h-3.5 w-3.5" /> Complete</>}
          </Button>
          <button
            onClick={() => router.push(`/tasks/${task._id}`)}
            className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] hover:border-white/[0.14] transition-all text-white/40 hover:text-white"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
