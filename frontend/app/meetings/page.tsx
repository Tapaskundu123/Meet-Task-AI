'use client';

import { useEffect, useState } from 'react';
import { getMeetings, deleteMeeting, Meeting } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, CheckCircle2, Trash2, Brain, ChevronRight, 
  Search, Filter, Plus, Clock, FileText, AudioLines, Sparkles
} from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setMeetings(await getMeetings());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this meeting intelligence record? All extracted tasks will be lost.')) return;
    await deleteMeeting(id);
    setMeetings(m => m.filter(x => x._id !== id));
  }

  return (
    <div className="fade-in max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl glow-text">Meeting Intelligence Archive</h1>
          <p className="text-muted-foreground mt-2 font-medium">Historical records and AI-extracted actionable insights</p>
        </div>
        <Link href="/upload">
          <Button className="font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
            <Plus className="h-4 w-4" /> Transcribe New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-card/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-border/40">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Retrieving records...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl flex items-center gap-4 text-destructive slide-in-bottom">
          <Trash2 className="h-6 w-6" />
          <div>
            <h3 className="font-black uppercase tracking-wider text-xs mb-1">Database Error</h3>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      ) : meetings.length === 0 ? (
        <Card className="bg-card/20 backdrop-blur-md border-2 border-dashed border-border/40 p-16 text-center stagger">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
             <FileText className="h-10 w-10 text-primary opacity-60" />
          </div>
          <h2 className="text-2xl font-black mb-2">No meetings indexed</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
            Your intelligence archive is currently empty. Start by uploading a recording or meeting notes.
          </p>
          <Link href="/upload">
            <Button size="lg" className="px-10 font-black tracking-widest uppercase text-xs">Process First Meeting</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 stagger">
          {meetings.map(m => {
            const tasks = Array.isArray(m.tasks) ? (m.tasks as any[]) : [];
            const done = tasks.filter(t => t.status === 'done').length;
            const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;
            
            return (
              <Card key={m._id} className="group overflow-hidden bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/40 hover:bg-card/60 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        {m.audioFile ? (
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black tracking-widest text-[9px] uppercase px-2 h-5">
                            <AudioLines className="h-3 w-3 mr-1" /> AUDIO SOURCE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-white/5 text-muted-foreground border-white/5 font-black tracking-widest text-[9px] uppercase px-2 h-5">
                            <FileText className="h-3 w-3 mr-1" /> TEXT SOURCE
                          </Badge>
                        )}
                        <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(m.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>

                      <Link href={`/meetings/${m._id}`} className="block">
                        <h2 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                          {m.title}
                        </h2>
                      </Link>

                      {m.summary && (
                        <p className="text-base text-muted-foreground/80 leading-relaxed line-clamp-2 max-w-4xl font-medium italic">
                          &ldquo;{m.summary}&rdquo;
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-5 pt-2">
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                           <CheckCircle2 className={`h-4 w-4 ${progress === 100 ? 'text-green-500' : 'text-primary'}`} />
                           <span className="text-xs font-bold text-foreground/80">{done}/{tasks.length} Tasks Finalized</span>
                        </div>
                        {m.audioFile && (
                          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 max-w-xs overflow-hidden">
                             <Sparkles className="h-3.5 w-3.5 text-primary" />
                             <span className="text-[11px] font-bold text-primary/80 truncate">Whisper Transcription Core V2</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 min-w-[200px]">
                      <Link href={`/meetings/${m._id}`} className="w-full">
                        <Button variant="default" className="w-full h-11 font-black shadow-xl shadow-primary/10">
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" className="h-11 border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 font-bold transition-all" onClick={() => handleDelete(m._id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete 
                      </Button>
                    </div>
                  </div>

                  {/* Execution Progress Track */}
                  {tasks.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/20">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                           <Brain className="h-3.5 w-3.5 text-muted-foreground" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Execution Efficiency</span>
                        </div>
                        <span className="text-xs font-black text-primary">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-white/5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
