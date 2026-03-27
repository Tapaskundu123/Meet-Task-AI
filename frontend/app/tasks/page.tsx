'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTasks, updateTask, deleteTask, Task } from '@/lib/api';
import TaskCard from '@/components/TaskCard';
import TaskDetailSheet from '@/components/TaskDetailSheet';
import FilterBar from '@/components/FilterBar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LayoutGrid, List, Filter, RefreshCw, Search, 
  Plus, Calendar, Activity, CheckCircle2, User, 
  Clock, ArrowRight, AlertCircle, FileText
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InitialAvatar from '@/components/InitialAvatar';

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [owner, setOwner] = useState('');
  const [member, setMember] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const fetch = useCallback(async () => {
    setLoading(true);
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

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpdate = async (updated: Task) => {
    try {
      const res = await updateTask(updated._id, updated);
      setTasks(current => current.map(t => t._id === res._id ? res : t));
      if (selectedTask?._id === res._id) setSelectedTask(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(current => current.filter(t => t._id !== taskId));
      if (selectedTask?._id === taskId) setSelectedTask(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fade-in max-w-7xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl glow-text">Task Master</h1>
          <p className="text-muted-foreground mt-2 font-medium flex items-center gap-2">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-2">{total}</Badge>
             Mission critical objectives identified
          </p>
        </div>
        
        <div className="flex items-center gap-3 p-1.5 bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 shadow-xl shadow-black/20">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('grid')}
            className={`h-10 px-4 rounded-xl font-bold gap-2 transition-all duration-300 ${view === 'grid' ? 'shadow-lg shadow-primary/20' : 'text-muted-foreground'}`}
          >
            <LayoutGrid className="h-4 w-4" /> Grid
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('table')}
            className={`h-10 px-4 rounded-xl font-bold gap-2 transition-all duration-300 ${view === 'table' ? 'shadow-lg shadow-primary/20' : 'text-muted-foreground'}`}
          >
            <List className="h-4 w-4" /> Table
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/40 backdrop-blur-xl border border-border/40 shadow-2xl overflow-hidden ring-1 ring-white/5">
         <CardContent className="p-6">
            <FilterBar
              status={status} priority={priority} owner={owner} member={member}
              onStatusChange={setStatus} onPriorityChange={setPriority} onOwnerChange={setOwner} onMemberChange={setMember}
              onReset={() => { setStatus(''); setPriority(''); setOwner(''); setMember(''); }}
            />
         </CardContent>
      </Card>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[1,2,3,4].map(i => <div key={i} className="h-48 w-full rounded-2xl bg-white/5 animate-pulse border border-white/5" />)}
          </div>
        ) : error ? (
          <Card className="max-w-xl mx-auto p-12 text-center bg-destructive/5 border-destructive/20 border-dashed stagger">
             <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
             <h3 className="text-xl font-black mb-2 text-destructive">Synchronization Error</h3>
             <p className="text-muted-foreground mb-8 font-medium">{error}</p>
             <Button variant="outline" onClick={fetch} className="gap-2 font-bold px-8">
                <RefreshCw className="h-4 w-4" /> Re-sync
             </Button>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="p-24 text-center bg-card/20 backdrop-blur-md border border-dashed border-border/60 stagger">
            <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-inner group hover:scale-110 transition-transform duration-500">
               <Plus className="h-12 w-12 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">System Purge: All Clear</h2>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-10 leading-relaxed text-lg italic">
              &ldquo;The current sectors are clear of pending objectives. No matches found for your active filters.&rdquo;
            </p>
            <Button variant="default" className="px-12 h-12 font-black tracking-widest uppercase text-xs" onClick={() => { setStatus(''); setPriority(''); setOwner(''); }}>Reset Global Filters</Button>
          </Card>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger">
            {tasks.map(task => (
              <div key={task._id} className="fade-in scale-in">
                <TaskCard
                  task={task}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onViewDetails={setSelectedTask}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Premium Table View */
          <Card className="bg-card/40 backdrop-blur-xl border border-border/40 shadow-2xl overflow-hidden ring-1 ring-white/5 stagger">
            <div className="overflow-x-auto custom-scrollbar">
               <Table>
                 <TableHeader className="bg-white/5 border-b-2 border-border/20">
                   <TableRow className="hover:bg-transparent border-none">
                     <TableHead className="w-[400px] font-black uppercase tracking-widest text-[10px] py-5 px-8">Objective Context</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] py-5">Personnel</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] py-5">Global Status</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] py-5">Priority Level</TableHead>
                     <TableHead className="font-black uppercase tracking-widest text-[10px] py-5 text-right">Target Window</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {tasks.map((task, idx) => {
                     const overdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date();
                     return (
                       <TableRow 
                         key={task._id} 
                         className="group border-border/10 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                         onClick={() => setSelectedTask(task)}
                       >
                         <TableCell className="py-5 px-8">
                           <div className="flex items-center gap-4">
                              <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.25)] ${task.status === 'done' ? 'bg-green-500 shadow-green-500/40' : task.status === 'in_progress' ? 'bg-blue-400 shadow-blue-400/40' : 'bg-zinc-600'}`} />
                              <div className="min-w-0">
                                 <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">{task.description}</p>
                                 <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest truncate max-w-[300px]">{task.meeting_id ? `Source: Intel Record #${task.meeting_id.slice(-6)}` : 'Manual Entry Objective'}</p>
                              </div>
                           </div>
                         </TableCell>
                         <TableCell className="py-5">
                            <div className="flex items-center gap-2.5">
                               <InitialAvatar name={task.owner || 'AI'} size="sm" className="border-white/10" />
                               <span className="text-xs font-black tracking-tight text-foreground/80">{task.owner || 'System'}</span>
                            </div>
                         </TableCell>
                         <TableCell className="py-5">
                            <Badge variant="secondary" className={`bg-transparent border-none font-black text-[9px] tracking-widest uppercase p-0 ${task.status === 'done' ? 'text-green-500' : task.status === 'in_progress' ? 'text-blue-400' : 'text-zinc-500'}`}>
                               {task.status.replace('_', ' ')}
                            </Badge>
                         </TableCell>
                         <TableCell className="py-5">
                            <div className="flex items-center gap-2">
                               <div className={`h-1.5 w-1.5 rounded-full ${task.priority === 'high' ? 'bg-red-500 animate-pulse' : task.priority === 'medium' ? 'bg-orange-400' : 'bg-zinc-600'}`} />
                               <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{task.priority}</span>
                            </div>
                         </TableCell>
                         <TableCell className="py-5 text-right font-mono text-[11px] font-bold pr-8">
                            <span className={overdue ? 'text-red-500' : 'text-muted-foreground/60'}>
                               {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '∞'}
                            </span>
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
            </div>
          </Card>
        )}
      </div>

      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
