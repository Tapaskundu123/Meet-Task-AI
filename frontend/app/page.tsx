'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTasks, Task } from '@/lib/api';
import TaskCard from '@/components/TaskCard';
import FilterBar from '@/components/FilterBar';
import TaskDetailSheet from '@/components/TaskDetailSheet';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Plus, LayoutGrid, List, RefreshCw, Target, Clock, CheckCircle2, AlertCircle, Flame, Timer,
} from 'lucide-react';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [owner, setOwner] = useState('');
  const [member, setMember] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTasks({ status, priority, owner, member });
      setTasks(res.tasks);
      setTotal(res.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [status, priority, owner, member]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  function handleViewDetails(task: Task) {
    setSelectedTask(task);
    setSheetOpen(true);
  }

  function handleUpdate(updated: Task) {
    setTasks(ts => ts.map(t => t._id === updated._id ? updated : t));
    if (selectedTask?._id === updated._id) setSelectedTask(updated);
  }

  function handleDelete(id: string) {
    setTasks(ts => ts.filter(t => t._id !== id));
    if (selectedTask?._id === id) { setSheetOpen(false); setSelectedTask(null); }
  }

  const stats = {
    total,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) < new Date()).length,
    high: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
  };

  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const statCards = [
    { label: 'Total Tasks', value: total, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Pending', value: stats.pending, icon: Timer, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'In Progress', value: stats.inProgress, icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Critical', value: stats.high, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="fade-in max-w-[1600px] mx-auto px-4 sm:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="page-title glow-text">Task Dashboard</h1>
          <p className="page-subtitle">AI-driven meeting intelligence &amp; action tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTasks} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Link href="/upload">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Meeting
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
        {statCards.map(s => (
          <Card key={s.label} className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 bg-card/30 backdrop-blur-xl border border-white/5">
            <div className="absolute top-0 right-0 w-16 h-16 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <s.icon className="w-full h-full -rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center border border-white/5 shadow-inner`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{s.label}</p>
                <span className={`text-2xl font-black ${s.color} tracking-tight block`}>{s.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <Card className="mb-16 bg-card/20 backdrop-blur-sm border-white/5 overflow-hidden group">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 w-full space-y-3">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                <span className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-primary" />
                  Mission Completion Progress
                </span>
                <span className="font-black text-primary text-sm">{completionPct}%</span>
              </div>
              <div className="relative">
                 <Progress value={completionPct} className="h-2 rounded-full bg-white/5" />
                 <div className="absolute top-0 left-0 h-full w-full pointer-events-none overflow-hidden rounded-full">
                    <div className="h-full w-20 bg-white/10 blur-md -skew-x-12 animate-shimmer" />
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-foreground">{stats.done} / {stats.total}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Operations Cleared</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <Card className="mb-16 bg-card/10 border-white/5 shadow-2xl">
        <CardContent className="p-4">
          <FilterBar
            status={status} priority={priority} owner={owner} member={member}
            onStatusChange={setStatus} onPriorityChange={setPriority}
            onOwnerChange={setOwner} onMemberChange={setMember}
            onReset={() => { setStatus(''); setPriority(''); setOwner(''); setMember(''); }}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      {loading ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="spinner w-10 h-10" />
            <p className="text-sm text-muted-foreground">Analyzing task repository…</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-bold text-destructive">Connection Error</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchTasks} className="mt-3 gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-2xl">📪</div>
            <h2 className="text-lg font-bold">No tasks found</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {status || priority || owner || member
                ? 'Your active filters returned no results.'
                : 'Process a new meeting to extract action items automatically.'}
            </p>
            {(status || priority || owner || member) ? (
              <Button variant="outline" size="sm" onClick={() => { setStatus(''); setPriority(''); setOwner(''); setMember(''); }}>
                Reset Filters
              </Button>
            ) : (
              <Link href="/upload"><Button size="sm">Start Transcribing</Button></Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grid">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{tasks.length}</span> task{tasks.length !== 1 ? 's' : ''}
            </p>
            <TabsList>
              <TabsTrigger value="grid" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-1.5">
                <List className="h-3.5 w-3.5" /> Table
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Grid View */}
          <TabsContent value="grid" className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10 stagger">
              {tasks.map(task => (
                <div key={task._id} className="fade-in">
                  <TaskCard
                    task={task}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Task</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map(task => {
                      const overdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date();
                      return (
                        <TableRow
                          key={task._id}
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => handleViewDetails(task)}
                        >
                          <TableCell>
                            <div className="flex items-start gap-2">
                              {overdue && <Clock className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />}
                              <span className="text-sm font-medium line-clamp-2">{task.description}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{task.owner || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{task.member || '—'}</TableCell>
                          <TableCell>
                            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={task.status === 'done' ? 'outline' : task.status === 'in-progress' ? 'default' : 'secondary'} className="text-xs">
                              {task.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Progress value={(task.confidence ?? 0.8) * 100} className="h-1.5 w-12" />
                              <span className="text-[10px] text-muted-foreground">{Math.round((task.confidence ?? 0.8) * 100)}%</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleViewDetails(task)}>
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelectedTask(null); }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
