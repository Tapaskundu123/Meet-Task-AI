'use client';

import { useState, useRef, DragEvent } from 'react';
import { submitText, uploadAudio, type SubmitResult } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, FileText, AlertCircle, Sparkles, 
  ChevronLeft, ArrowRight, Brain, Zap, RefreshCw, AudioLines
} from 'lucide-react';

type Tab = 'audio' | 'text';

export default function UploadPage() {
  const [tab, setTab] = useState<Tab>('text');
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const SAMPLE_TRANSCRIPT = `Team sync - March 2026

John will finalize the Q2 budget report by Friday.
Sarah needs to set up the staging environment by next Monday.
The design team, led by Alex, should complete the new logo by end of month.
Everyone agreed that Mike will schedule the client demo for next week.
Lisa will review all open PRs by tomorrow.
We need to update the documentation - this is high priority and should be done ASAP.`;

  async function handleSubmit() {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      if (tab === 'text') {
        if (!transcript.trim()) { setError('Please enter a transcript.'); setLoading(false); return; }
        setProgress('Sending to AI for task extraction…');
        const res = await submitText(transcript);
        setResult(res);
      } else {
        if (!file) { setError('Please select an audio file.'); setLoading(false); return; }
        setProgress('Uploading audio file…');
        const fd = new FormData();
        fd.append('audio', file);
        setProgress('Running Whisper transcription (this may take a minute)…');
        const res = await uploadAudio(fd);
        setResult(res);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setProgress('');
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function reset() {
    setResult(null);
    setError('');
    setTranscript('');
    setFile(null);
  }

  return (
    <div className="fade-in content-container max-w-5xl pb-24 md:pb-32">
      <div className="mb-16 md:mb-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3 glow-text">
          New Meeting Intelligence
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
          Transform your discussions into actionable project steps using local-first AI.
        </p>
      </div>

      {result ? (
        /* ---- Success State ---- */
        <div className="space-y-8 stagger">
          <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-xl overflow-hidden shadow-2xl shadow-green-500/5">
            <CardHeader className="p-8 pb-4 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center text-3xl shadow-inner border border-green-500/20">
                ✅
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl font-black text-green-400 mb-1">Analysis complete</CardTitle>
                <CardDescription className="text-green-300 font-bold uppercase tracking-wider text-xs">
                  Detected {result.meeting.taskCount} distinct action items
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-4 space-y-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="section-label">Meeting Executive Summary</h3>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-xl leading-relaxed italic text-lg text-foreground/90 font-medium">
                  &ldquo;{result.meeting.summary}&rdquo;
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-400" />
                  <h3 className="section-label">Identified Tasks</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.tasks.map((t, idx) => (
                    <Card key={idx} className="group p-5 bg-card/40 border-border/40 hover:border-primary/40 hover:bg-card transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className={`w-1.5 h-10 rounded-full shrink-0 ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">{t.description}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className="text-[10px] h-5 px-2 font-bold uppercase tracking-wider">{t.owner}</Badge>
                            {t.deadline && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                <Zap className="h-3 w-3" /> {t.deadline}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-10 gap-2 font-black">
                <ChevronLeft className="h-4 w-4" /> Return to Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 gap-2" onClick={reset}>
               Process another meeting <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* ---- Input State ---- */
        <div className="stagger max-w-4xl mx-auto pb-12">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <TabsList className="bg-card/40 backdrop-blur-md border border-border/40 p-1 h-12">
                <TabsTrigger value="text" className="h-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4" /> Manual Entry
                </TabsTrigger>
                <TabsTrigger value="audio" className="h-full px-8 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <AudioLines className="h-4 w-4" /> Audio Upload
                </TabsTrigger>
              </TabsList>
              
              {tab === 'text' && (
                <Button variant="ghost" size="sm" onClick={() => setTranscript(SAMPLE_TRANSCRIPT)} className="gap-2 font-bold text-primary hover:bg-primary/10">
                  <Sparkles className="h-4 w-4" /> Load Sample Data
                </Button>
              )}
            </div>

            <Card className="bg-card/40 backdrop-blur-md border-border/40 overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                <TabsContent value="text" className="m-0 p-8 space-y-6">
                  <div>
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 block">Meeting Transcript Data</label>
                    <Textarea
                      className="min-h-[350px] bg-black/20 border-border/40 text-lg font-medium leading-relaxed p-6 focus:bg-black/40 transition-all rounded-xl"
                      placeholder="Paste your meeting notes or transcript here. AI will automatically identify who needs to do what and by when."
                      value={transcript}
                      onChange={e => setTranscript(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground/40 px-1">
                    <span className={transcript.length < 20 ? 'text-orange-400' : 'text-primary/60'}>
                      {transcript.length < 20 ? 'MIN 20 CHARS REQUIRED' : 'READY TO ANALYZE'}
                    </span>
                    <span className="tracking-widest">{transcript.length} CHARACTERS</span>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="m-0 p-8 space-y-6">
                  <div className="space-y-6">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block">Local Voice Capture</label>
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-16 text-center group cursor-pointer transition-all duration-300 overflow-hidden ${dragging ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.01]' : 'border-border/40 hover:border-primary/40 hover:bg-white/5'}`}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      {file ? (
                        <div className="relative z-10 animate-fade-in space-y-4">
                          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-primary/20 animate-pulse-glow">
                             <AudioLines className="h-10 w-10 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-foreground mb-1 truncate max-w-xs mx-auto">{file.name}</h3>
                            <p className="text-primary font-bold tracking-widest text-[10px] uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB · READY</p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 px-6 font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30"
                            onClick={e => { e.stopPropagation(); setFile(null); }}
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <div className="relative z-10 space-y-6 py-4">
                          <div className="w-24 h-24 bg-card/60 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/5 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-primary/10 transition-all duration-500">
                            <Upload className="h-10 w-10 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black mb-2">Drag and drop audio</h3>
                            <p className="text-muted-foreground font-medium mb-3">Professional transcription for MP3, WAV, and M4A</p>
                            <div className="flex items-center justify-center gap-2">
                               <Badge variant="secondary" className="bg-white/5 border-none font-bold text-[10px] tracking-widest text-muted-foreground/60 uppercase">Max 500MB</Badge>
                               <Badge variant="secondary" className="bg-white/5 border-none font-bold text-[10px] tracking-widest text-muted-foreground/60 uppercase">AES-256 Secured</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className={`absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-500 ${dragging ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl flex items-start gap-4">
                      <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                         <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary-foreground/90 mb-1">Local Processing Enabled</p>
                        <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                          Using local <strong>Faster Whisper</strong> technology. Your audio stays private on this server. 
                          Intelligence extraction is handled by our agentic LLM pipeline.
                        </p>
                      </div>
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a" className="hidden"
                    onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
                </TabsContent>

                {error && (
                  <div className="mx-8 mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-left-2 transition-all">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-bold text-red-400">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="mx-8 mb-8 space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between text-[11px] font-black tracking-[0.2em] mb-2 p-1">
                      <div className="flex items-center gap-2">
                         <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                         <span className="text-primary">{progress}</span>
                      </div>
                      <span className="text-muted-foreground/40">POWERED BY DEEPSEEK</span>
                    </div>
                    <ProgressBar value={100} className="h-1.5 animate-pulse bg-white/5" />
                  </div>
                )}

                <div className="p-8 pt-0">
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-black tracking-wider shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? <><RefreshCw className="h-5 w-5 mr-3 animate-spin" /> ANALYZING...</> : <><Sparkles className="h-5 w-5 mr-3" /> GENERATE INTELLIGENCE</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Tabs>
          
          <div className="mt-12 text-center text-muted-foreground/30 text-[10px] font-black uppercase tracking-[0.3em]">
            Encryption: AES-256 · Runtime: Node.js 20+ · Privacy: On-Device
          </div>
        </div>
      )}
    </div>
  );
}
