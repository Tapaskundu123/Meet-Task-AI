import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, updateTask, deleteTask } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar, Clock, User, Users, Zap, Brain, Trash2, CheckCircle2, RefreshCw, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  task: Task;
  onUpdate: (updated: Task) => void;
  onDelete: (id: string) => void;
}

import InitialAvatar from '@/components/InitialAvatar';

const PRIORITY_CONFIG = {
  high:   { emoji: '🔴', label: 'High',   cls: 'bg-red-500/10 text-red-400 border-red-500/25' },
  medium: { emoji: '🟡', label: 'Medium', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25' },
  low:    { emoji: '🟢', label: 'Low',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
};

const STATUS_CONFIG = {
  pending:      { label: 'Pending',     cls: 'bg-purple-500/10 text-purple-400 border-purple-500/25' },
  'in-progress':{ label: 'In Progress', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
  done:         { label: 'Done',        cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
};

export default function TaskCard({ task, onUpdate, onDelete }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const overdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date();
  const meetingTitle = typeof task.meeting === 'object' ? task.meeting?.title : null;

  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low;
  const status   = STATUS_CONFIG[task.status]   ?? STATUS_CONFIG.pending;

  async function handleToggleStatus() {
    const next = task.status === 'done' ? 'pending' : 'done';
    try {
      const updated = await updateTask(task._id, { status: next });
      onUpdate(updated);
    } catch { }
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

  const confidencePct = Math.round((task.confidence ?? 0.8) * 100);

  return (
    <div
      onClick={() => router.push(`/tasks/${task._id}`)}
      className={cn(
        'group relative flex flex-col rounded-3xl cursor-pointer',
        'bg-gradient-to-br from-[oklch(0.15_0.02_240)] to-[oklch(0.13_0.02_240)]',
        'border transition-all duration-300',
        'hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1',
        overdue
          ? 'border-red-500/30 shadow-red-500/5 shadow-lg'
          : 'border-white/[0.07] hover:border-primary/25'
      )}
    >
      {/* Overdue left border accent */}
      {overdue && (
        <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-red-500/70 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
      )}

      {/* Hover shimmer */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      {/* --- Header --- */}
      <div className="px-6 pt-6 pb-4">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border',
              priority.cls
            )}>
              {priority.emoji} {priority.label}
            </span>
            <span className={cn(
              'inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border',
              status.cls
            )}>
              {status.label}
            </span>
            {overdue && (
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/25">
                ⚠ Overdue
              </span>
            )}
          </div>

          {/* Delete btn */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-7 w-7 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 flex-shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Task description */}
        <p className="text-[13px] font-semibold leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2">
          {task.description}
        </p>
      </div>

      {/* --- Body --- */}
      <div className="px-6 pb-6 flex flex-col gap-4 flex-1">
        {/* Thin divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* People */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
              <User className="h-3 w-3 text-muted-foreground/60" />
            </div>
            <InitialAvatar name={task.owner || '?'} size="sm" />
            <span className="text-[11px] font-medium text-muted-foreground/80 truncate">{task.owner || 'Unassigned'}</span>
          </div>
          {task.member && task.member !== task.owner && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <Users className="h-3 w-3 text-muted-foreground/60" />
              </div>
              <InitialAvatar name={task.member} size="sm" />
              <span className="text-[11px] font-medium text-muted-foreground/80 truncate">{task.member}</span>
            </div>
          )}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          {task.deadline && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-[14px] text-[10px] font-bold border',
              overdue
                ? 'bg-red-500/10 border-red-500/25 text-red-400'
                : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground/70'
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[14px] text-[10px] font-bold border bg-white/[0.04] border-white/[0.08] text-muted-foreground/70">
            <Clock className="h-3 w-3" />
            {task.estimated_duration_hours}h
          </div>
          {meetingTitle && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[14px] text-[10px] font-bold border bg-primary/[0.08] border-primary/20 text-primary/70">
              <Brain className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{meetingTitle}</span>
            </div>
          )}
        </div>

        {/* Confidence bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/50">
              <Zap className="h-3 w-3" />
              Confidence
            </div>
            <span className="text-[10px] font-black text-primary">{confidencePct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 shadow-sm"
              style={{ width: `${confidencePct}%`, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }}
            />
          </div>
        </div>

        {/* AI Agent note */}
        {task.agentMessages && task.agentMessages.length > 0 && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-primary/[0.06] border border-primary/15">
            <Brain className="h-3.5 w-3.5 text-primary/60 flex-shrink-0 mt-px" />
            <p className="text-[10px] leading-relaxed text-foreground/70 italic line-clamp-2">
              &ldquo;{task.agentMessages[task.agentMessages.length - 1].message}&rdquo;
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex gap-2 pt-1 mt-auto" onClick={e => e.stopPropagation()}>
          <Button
            variant={task.status === 'done' ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
            className="flex-1 gap-1.5 text-[11px] font-bold uppercase tracking-wider h-9 rounded-xl"
          >
            {task.status === 'done'
              ? <><RefreshCw className="h-3.5 w-3.5" /> Reopen</>
              : <><CheckCircle2 className="h-3.5 w-3.5" /> Complete</>}
          </Button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${task._id}`); }}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200 text-muted-foreground/60 hover:text-foreground flex-shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
