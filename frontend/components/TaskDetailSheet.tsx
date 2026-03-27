'use client';

import { useState } from 'react';
import { Task, updateTask, deleteTask } from '@/lib/api';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Calendar, Clock, User, Users, Zap, Brain, Trash2, Pencil, CheckCircle2, RefreshCw,
} from 'lucide-react';

interface Props {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (t: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'secondary',
  'in-progress': 'default',
  done: 'outline',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
      {initials || '?'}
    </div>
  );
}

export default function TaskDetailSheet({ task, open, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Task>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!task) return null;

  const overdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date();
  const meetingTitle = typeof task.meeting === 'object' ? task.meeting?.title : null;

  function startEdit() {
    setForm({
      description: task!.description,
      owner: task!.owner,
      member: task!.member,
      deadline: task!.deadline ? task!.deadline.slice(0, 10) : '',
      priority: task!.priority,
      status: task!.status,
      estimated_duration_hours: task!.estimated_duration_hours,
    });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateTask(task!._id, {
        ...form,
        deadline: (form.deadline as string) || null,
      });
      onUpdate(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    const next = task!.status === 'done' ? 'pending' : 'done';
    const updated = await updateTask(task!._id, { status: next });
    onUpdate(updated);
  }

  async function handleDelete() {
    if (!confirm('Delete this task permanently?')) return;
    setDeleting(true);
    try {
      await deleteTask(task!._id);
      onDelete(task!._id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) { onClose(); setEditing(false); } }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={PRIORITY_COLOR[task.priority] as 'destructive' | 'secondary' | 'outline' | 'default'}>
              {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} {task.priority.toUpperCase()}
            </Badge>
            <Badge variant={STATUS_COLOR[task.status] as 'destructive' | 'secondary' | 'outline' | 'default'}>
              {task.status.replace('-', ' ')}
            </Badge>
            {overdue && <Badge variant="destructive">⚠ OVERDUE</Badge>}
          </div>
          <SheetTitle className="text-lg leading-snug">{task.description}</SheetTitle>
          {meetingTitle && (
            <SheetDescription className="flex items-center gap-1 mt-1">
              <Brain className="h-3.5 w-3.5" /> From: {meetingTitle}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 px-6 py-5 space-y-6">
          {editing ? (
            /* ---- Edit Form ---- */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Description</label>
                <Textarea value={form.description as string} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Owner</label>
                  <Input value={form.owner as string} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Member</label>
                  <Input value={form.member as string} onChange={e => setForm(f => ({ ...f, member: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Deadline</label>
                  <Input type="date" value={form.deadline as string} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Est. Hours</label>
                  <Input type="number" min={0.5} step={0.5} value={form.estimated_duration_hours as number} onChange={e => setForm(f => ({ ...f, estimated_duration_hours: parseFloat(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Priority</label>
                  <Select value={form.priority as string} onValueChange={v => setForm(f => ({ ...f, priority: v as Task['priority'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5 block">Status</label>
                  <Select value={form.status as string} onValueChange={v => setForm(f => ({ ...f, status: v as Task['status'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            /* ---- View Mode ---- */
            <>
              {/* People */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">People</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Owner</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <InitialAvatar name={task.owner || '?'} />
                        <p className="text-sm font-medium truncate">{task.owner || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Member</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <InitialAvatar name={task.member || '?'} />
                        <p className="text-sm font-medium truncate">{task.member || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</p>
                  </div>
                  <p className={`text-sm font-semibold ${overdue ? 'text-destructive' : ''}`}>{formatDate(task.deadline)}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Est. Duration</p>
                  </div>
                  <p className="text-sm font-semibold">{task.estimated_duration_hours}h</p>
                </div>
              </div>

              {/* Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">AI Confidence</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{Math.round((task.confidence ?? 0.8) * 100)}%</span>
                </div>
                <Progress value={(task.confidence ?? 0.8) * 100} className="h-2" />
              </div>

              <Separator />

              {/* AI Agent Timeline */}
              {task.agentMessages && task.agentMessages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-purple-400" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">LangGraph Agent Activity</p>
                  </div>
                  <div className="space-y-3">
                    {task.agentMessages.map((msg, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                          {i < task.agentMessages.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="pb-3 flex-1">
                          <p className="text-xs text-muted-foreground mb-1">{timeAgo(msg.generatedAt)}</p>
                          <p className="text-sm leading-relaxed text-foreground/80 italic">&ldquo;{msg.message}&rdquo;</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.created_at && (
                <p className="text-[11px] text-muted-foreground">
                  Created {formatDate(task.created_at)}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!editing && (
          <div className="px-6 py-4 border-t border-border flex gap-2">
            <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant={task.status === 'done' ? 'outline' : 'default'}
              size="sm"
              onClick={handleToggle}
              className="gap-1.5 flex-1"
            >
              {task.status === 'done'
                ? <><RefreshCw className="h-3.5 w-3.5" /> Reopen</>
                : <><CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete</>}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
