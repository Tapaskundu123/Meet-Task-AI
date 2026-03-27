'use client';

import { useEffect, useState, use } from 'react';
import { getMeeting, updateTask, deleteTask, Meeting, Task } from '@/lib/api';
import TaskCard from '@/components/TaskCard';
import TaskDetailSheet from '@/components/TaskDetailSheet';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, Calendar, CheckCircle2, FileText, 
  Brain, Zap, Clock, Sparkles, BookOpen, Trash2
} from 'lucide-react';

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    getMeeting(id)
      .then(setMeeting)
      .catch(e => setError(e instanceof Error ? e.message : 'Meeting not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (updated: Task) => {
    try {
      const res = await updateTask(updated._id, updated);
      setMeeting(m => m ? {
        ...m,
        tasks: (m.tasks as Task[]).map(t => t._id === res._id ? res : t),
      } : m);
      if (selectedTask?._id === res._id) setSelectedTask(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete task?')) return;
    try {
      await deleteTask(taskId);
      setMeeting(m => m ? {
        ...m,
        tasks: (m.tasks as Task[]).filter(t => t._id !== taskId),
      } : m);
      if (selectedTask?._id === taskId) setSelectedTask(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-card/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-border/40 max-w-4xl mx-auto">
      <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Loading intelligence...</p>
    </div>
  );

  if (error || !meeting) return (
    <Card className="max-w-2xl mx-auto p-12 text-center bg-destructive/5 border-destructive/20">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Trash2 className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-black mb-2 text-destructive">Record Not Found</h2>
      <p className="text-muted-foreground mb-8 font-medium">{error || 'The requested meeting record could not be retrieved from the intelligence archive.'}</p>
      <Link href="/meetings">
        <Button variant="outline" className="px-8 font-bold">Return to Archive</Button>
      </Link>
    </Card>
  );

  const tasks = (meeting.tasks as Task[]) || [];
  const done = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  return (
    <div className="fade-in max-w-6xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        <Link href="/meetings">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/40 hover:bg-white/5 transition-all shadow-xl">
             <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black tracking-widest text-[9px] uppercase h-5">
                INTEL RECORD #{id.slice(-6)}
             </Badge>
             <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5 ml-2">
                <Calendar className="h-3 w-3" />
                {new Date(meeting.created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
             </span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight lg:text-5xl truncate leading-tight">
            {meeting.title}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Summary */}
          {meeting.summary && (
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-primary" />
                  <CardDescription className="font-black uppercase tracking-widest text-[10px] text-primary/60">AI Intelligence Summary</CardDescription>
                </div>
                <CardTitle className="text-2xl font-black">Executive Briefing</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="text-lg leading-relaxed text-foreground/90 font-medium italic">
                  &ldquo;{meeting.summary}&rdquo;
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tasks Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Zap className="h-5 w-5 text-orange-400" />
                Extracted Action Items ({tasks.length})
              </h2>
            </div>
            
            {tasks.length === 0 ? (
              <Card className="p-12 text-center bg-white/5 border-dashed border-border/20">
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No actionable intelligence detected</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger">
                {tasks.map(task => (
                  <div key={task._id} className="fade-in">
                    <TaskCard
                      task={task}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onViewDetails={setSelectedTask}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transcript Section */}
          <Card className="bg-card/20 border-border/40 overflow-hidden group">
            <button 
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left group"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                  <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Source Transcript</h3>
                  <p className="text-[11px] font-bold text-muted-foreground opacity-60">Full records from the original session</p>
                </div>
              </div>
              <div className={`transition-transform duration-300 ${showTranscript ? 'rotate-180' : ''}`}>
                 <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
            
            {showTranscript && (
              <CardContent className="px-6 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                <Separator className="mb-6 bg-border/20" />
                <div className="p-6 rounded-xl bg-black/40 border border-border/20 font-mono text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar">
                  {meeting.transcript}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-8">
          {/* Progress Card */}
          <Card className="bg-primary/5 border-primary/20 shadow-2xl shadow-primary/5">
             <CardHeader className="p-6 pb-2">
                <CardDescription className="font-black uppercase tracking-widest text-[10px] text-primary/60">Execution Status</CardDescription>
                <CardTitle className="text-xl font-black">Record Progress</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-end">
                   <span className="text-4xl font-black text-primary">{Math.round(progress)}%</span>
                   <span className="text-xs font-bold text-muted-foreground uppercase mb-2">{done} / {tasks.length} Resolved</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/10" />
                
                <div className="pt-4 space-y-3">
                   <div className="flex items-center gap-3 text-xs font-bold text-foreground/70">
                      <CheckCircle2 className={`h-4 w-4 ${progress === 100 ? 'text-green-500' : 'text-primary/40'}`} />
                      {progress === 100 ? 'Intelligence fully executed' : 'Insights pending execution'}
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-foreground/70">
                      <Clock className="h-4 w-4 text-primary/40" />
                      Historical Intelligence
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="bg-card/40 border-border/40">
             <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                   <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Owner</span>
                   <span className="text-xs font-bold">System AI Agent</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/20">
                   <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Context Integrity</span>
                   <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none font-black text-[9px]">SECURE</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                   <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Security Level</span>
                   <span className="text-xs font-bold">AES-256 Local</span>
                </div>
             </CardContent>
          </Card>
        </div>
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
