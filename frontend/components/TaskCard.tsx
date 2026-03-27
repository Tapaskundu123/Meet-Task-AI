'use client';

import { useState } from 'react';
import { Task, updateTask, deleteTask } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar, Clock, User, Users, Zap, Brain, Trash2, Pencil, CheckCircle2, RefreshCw, ExternalLink,
} from 'lucide-react';

interface Props {
  task: Task;
  onUpdate: (updated: Task) => void;
  onDelete: (id: string) => void;
  onViewDetails: (task: Task) => void;
}

import InitialAvatar from '@/components/InitialAvatar';

export default function TaskCard({ task, onUpdate, onDelete, onViewDetails }: Props) {
  const [deleting, setDeleting] = useState(false);

  const overdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date();
  const meetingTitle = typeof task.meeting === 'object' ? task.meeting?.title : null;

  async function handleToggleStatus() {
    const next = task.status === 'done' ? 'pending' : 'done';
    try {
      const updated = await updateTask(task._id, { status: next });
      onUpdate(updated);
    } catch { }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await deleteTask(task._id);
      onDelete(task._id);
    } catch { setDeleting(false); }
  }

  const priorityVariant: Record<string, 'destructive' | 'secondary' | 'outline'> = {
    high: 'destructive', medium: 'secondary', low: 'outline',
  };
  const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    pending: 'secondary', 'in-progress': 'default', done: 'outline',
  };

  return (
    <Card className={`group relative flex flex-col transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-2xl border border-white/5 overflow-hidden ${overdue ? 'border-l-4 border-l-destructive/50' : ''}`}>
      <CardHeader className="px-6 pt-6 pb-4">
        {/* Badge row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={priorityVariant[task.priority]}>
              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority}
            </Badge>
            <Badge variant={statusVariant[task.status]}>
              {task.status.replace('-', ' ')}
            </Badge>
            {overdue && <Badge variant="destructive">⚠ Overdue</Badge>}
          </div>

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Tooltip>
              <TooltipTrigger render={
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetails(task)} />
              }>
                <ExternalLink className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleting} />
              }>
                <Trash2 className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent>Delete Task</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Description */}
        <p className="text-[15px] font-bold leading-relaxed mt-4 line-clamp-2 text-foreground/90 group-hover:text-foreground transition-colors">
          {task.description}
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-6 flex-1">
        <Separator className="bg-border/30" />

        {/* People row */}
        <div className="flex items-center gap-6 text-[11px] font-medium text-muted-foreground">
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
            <InitialAvatar name={task.owner || '?'} size="sm" />
            <span className="truncate tracking-tight">{task.owner || 'Unassigned'}</span>
          </div>
          {task.member && task.member !== task.owner && (
            <div className="flex items-center gap-2 min-w-0">
              <Users className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              <InitialAvatar name={task.member} size="sm" />
              <span className="truncate tracking-tight">{task.member}</span>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-5 text-[11px] font-bold text-muted-foreground/60">
          {task.deadline && (
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 ${overdue ? 'text-destructive bg-destructive/5 border-destructive/20' : ''}`}>
              <Calendar className="h-3.5 w-3.5" />
              {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-foreground">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            {task.estimated_duration_hours}H
          </div>
          {meetingTitle && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary/70 hover:text-primary transition-colors cursor-default">
              <Brain className="h-3.5 w-3.5" />
              <span className="truncate max-w-[120px]">{meetingTitle}</span>
            </div>
          )}
        </div>

        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Confidence
            </div>
            <span className="text-primary">{Math.round((task.confidence ?? 0.8) * 100)}%</span>
          </div>
          <Progress value={(task.confidence ?? 0.8) * 100} className="h-1 bg-white/5" />
        </div>

        {/* AI Agent badge */}
        {task.agentMessages && task.agentMessages.length > 0 && (
          <div className="flex items-center gap-2.5 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
            <Brain className="h-4 w-4 text-primary/60 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed text-foreground/80 font-medium italic truncate">
              &ldquo;{task.agentMessages[task.agentMessages.length - 1].message}&rdquo;
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex gap-2.5 pt-2 mt-auto">
          <Button
            variant={task.status === 'done' ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
            className="flex-1 gap-2 text-[11px] font-bold uppercase tracking-wider h-9"
          >
            {task.status === 'done'
              ? <><RefreshCw className="h-3.5 w-3.5" /> Reopen</>
              : <><CheckCircle2 className="h-3.5 w-3.5" /> Complete</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(task)} className="h-9 w-9 p-0 bg-transparent border-border/40 hover:bg-white/5">
            <Pencil className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
