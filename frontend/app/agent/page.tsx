'use client';

import { useEffect, useState } from 'react';
import { getAgentMessages, runAgent, Task, AgentMessage } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, Play, Activity, MessageSquare, Clock, 
  Search, Brain, Send, CheckCircle2, AlertCircle, 
  Sparkles, Zap, ShieldCheck, ChevronRight
} from 'lucide-react';
import InitialAvatar from '@/components/InitialAvatar';

export default function AgentPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setTasks(await getAgentMessages());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRun() {
    setRunning(true);
    setRunMsg('');
    try {
      const res = await runAgent();
      setRunMsg(res.message);
      setTimeout(() => { load(); setRunMsg(''); }, 3000);
    } catch (e: unknown) {
      setRunMsg(e instanceof Error ? e.message : 'Failed to trigger agent');
    } finally {
      setRunning(false);
    }
  }

  const totalMessages = tasks.reduce((sum, t) => sum + (t.agentMessages?.length || 0), 0);

  return (
    <div className="fade-in max-w-6xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className={`h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/10 ${running ? 'animate-pulse' : ''}`}>
              <Bot className={`h-10 w-10 text-primary ${running ? 'animate-bounce' : ''}`} />
           </div>
           <div>
              <h1 className="text-4xl font-black tracking-tight glow-text">Autonomous AI Agent</h1>
              <p className="text-muted-foreground font-medium mt-1">
                Intelligent oversight for project velocity and task compliance
              </p>
           </div>
        </div>
        <Button 
          size="lg" 
          onClick={handleRun} 
          disabled={running} 
          className="h-14 px-8 gap-3 font-black tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {running ? <><RefreshCw className="h-5 w-5 animate-spin" /> SYNCHRONIZING...</> : <><Play className="h-5 w-5 fill-current" /> EXECUTE AGENT</>}
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Card className="bg-card/40 backdrop-blur-md border border-border/40 overflow-hidden group">
          <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                   <Activity className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-green-500/10 text-green-500 border-none">ACTIVE</Badge>
             </div>
             <div className="text-3xl font-black mb-1 tracking-tight">{tasks.length}</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Monitored Tasks</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/40 overflow-hidden group">
          <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                   <MessageSquare className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-blue-500/10 text-blue-400 border-none">TOTAL</Badge>
             </div>
             <div className="text-3xl font-black mb-1 tracking-tight">{totalMessages}</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Follow-up Dispatches</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/40 overflow-hidden group">
          <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                   <Clock className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-orange-500/10 text-orange-400 border-none">CRON</Badge>
             </div>
             <div className="text-3xl font-black mb-1 tracking-tight">1.0H</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Scan Cycle Interval</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/40 overflow-hidden group">
          <CardContent className="p-6">
             <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all">
                   <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-green-500/10 text-green-400 border-none">SECURE</Badge>
             </div>
             <div className="text-3xl font-black mb-1 tracking-tight">V3.2</div>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Intelligence Engine</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Workflow Explanation */}
      <Card className="bg-primary/5 border border-primary/10 overflow-hidden relative shadow-2xl shadow-primary/5">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Zap className="h-40 w-40 text-primary" />
        </div>
        <CardHeader className="p-8 pb-4">
           <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardDescription className="font-black uppercase tracking-widest text-[10px] text-primary/60">Operational Protocol</CardDescription>
           </div>
           <CardTitle className="text-2xl font-black">Intelligent Compliance Workflow</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="h-5 w-5" />, title: 'Predictive Scanning', desc: 'Identifies non-compliant tasks with overdue deadlines or 7+ days of stagnation using pattern analysis.' },
              { icon: <Brain className="h-5 w-5" />, title: 'Cognitive Analysis', desc: 'Processes context via the LLM core to evaluate project importance and team dynamics.' },
              { icon: <Send className="h-5 w-5" />, title: 'Smart Dispatch', desc: 'Generates non-intrusive, professional nudge messages that provide value and clear next steps.' },
            ].map((item, i) => (
              <div key={item.title} className="flex flex-col gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-inner border border-primary/20">
                   {item.icon}
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wider mb-2">{item.title}</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {runMsg && (
        <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex items-center justify-between gap-4 text-green-400 animate-in zoom-in-95 shadow-xl shadow-green-500/5">
           <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">{runMsg}</span>
           </div>
           <Badge className="bg-green-500 text-black font-black text-[9px]">SUCCESS</Badge>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
             <MessageSquare className="h-6 w-6 text-primary" />
             Active Follow-up Log
          </h2>
          <Badge variant="outline" className="bg-white/5 border-border/40 font-bold uppercase tracking-widest text-[10px] px-3">
             Live Intelligence
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
             {[1,2,3].map(i => <div key={i} className="h-40 w-full rounded-2xl bg-white/5 animate-pulse border border-white/5" />)}
          </div>
        ) : error ? (
          <Card className="p-12 text-center bg-destructive/5 border-destructive/20">
             <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
             <p className="text-destructive font-bold">{error}</p>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="p-20 text-center bg-card/20 backdrop-blur-md border-2 border-dashed border-border/40 stagger">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
               <ShieldCheck className="h-10 w-10 text-primary opacity-60" />
            </div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">All Tasks Compliant</h2>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-8 leading-relaxed">
              Our agent has verified that all mission-critical tasks are within their operational parameters.
            </p>
            <Button variant="outline" className="px-10 font-black tracking-widest text-[10px] uppercase h-11" onClick={handleRun}>Force Re-Verification</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 stagger">
            {tasks.map(task => (
              <Card key={task._id} className="bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/40 transition-all duration-300 overflow-hidden">
                <CardHeader className="p-6 border-b border-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <InitialAvatar name={task.owner || 'AI'} size="md" />
                    <div className="min-w-0">
                       <h3 className="font-bold text-foreground text-sm truncate leading-snug">{task.description}</h3>
                       <div className="flex flex-wrap items-center gap-3 mt-1.5 font-bold uppercase tracking-widest text-[9px] text-muted-foreground/60">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'NO DEADLINE'}</span>
                          <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> {task.priority} Priority</span>
                          <span className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" /> {task.status}</span>
                       </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-none font-black text-[9px] tracking-[0.2em] px-3 h-6">UNDER EVALUATION</Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {(task.agentMessages as AgentMessage[]).map((msg, i) => (
                    <div key={i} className="flex gap-4 group/msg animate-in slide-in-from-left-2 duration-300">
                       <div className="flex flex-col items-center gap-2 pt-1 border-r border-border/20 pr-4">
                          <Bot className="h-4 w-4 text-primary" />
                          <div className="w-px h-full bg-border/20 group-last/msg:bg-transparent" />
                       </div>
                       <div className="flex-1 pb-6 group-last/msg:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Node 01</span>
                             <span className="text-[10px] font-bold text-muted-foreground opacity-40">{new Date(msg.generatedAt).toLocaleString()}</span>
                          </div>
                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 shadow-inner group-hover/msg:bg-primary/10 transition-colors">
                             <p className="text-sm leading-relaxed text-foreground/90 font-medium italic">
                                &ldquo;{msg.message}&rdquo;
                             </p>
                          </div>
                       </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
