'use client';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal, User, Users, Flag, Activity, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  status: string;
  priority: string;
  owner: string;
  member: string;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onOwnerChange: (v: string) => void;
  onMemberChange: (v: string) => void;
  onReset: () => void;
}

export default function FilterBar({
  status, priority, owner, member,
  onStatusChange, onPriorityChange, onOwnerChange, onMemberChange,
  onReset,
}: Props) {
  const hasFilters = !!(status || priority || owner || member);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70">Intelligence Filters</span>
        </div>
        
        {hasFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset} 
            className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <Activity className="h-3 w-3" /> Status
          </label>
          <Select value={status || 'all'} onValueChange={(v: string | null) => onStatusChange(v === 'all' || !v ? '' : v)}>
            <SelectTrigger className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] focus:ring-primary/20 text-xs font-medium">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/[0.08] bg-[oklch(0.13_0.02_240)]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <Flag className="h-3 w-3" /> Priority
          </label>
          <Select value={priority || 'all'} onValueChange={(v: string | null) => onPriorityChange(v === 'all' || !v ? '' : v)}>
            <SelectTrigger className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] focus:ring-primary/20 text-xs font-medium">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/[0.08] bg-[oklch(0.13_0.02_240)]">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">🔴 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Owner Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <User className="h-3 w-3" /> Owner
          </label>
          <div className="relative">
            <Input
              className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] focus:border-primary/40 focus:ring-primary/20 text-xs pl-9 placeholder:text-muted-foreground/30"
              placeholder="Search by owner..."
              value={owner}
              onChange={e => onOwnerChange(e.target.value)}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
          </div>
        </div>

        {/* Member Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            <Users className="h-3 w-3" /> Member
          </label>
          <div className="relative">
            <Input
              className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] focus:border-primary/40 focus:ring-primary/20 text-xs pl-9 placeholder:text-muted-foreground/30"
              placeholder="Search by member..."
              value={member}
              onChange={e => onMemberChange(e.target.value)}
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
          </div>
        </div>

        {/* Reset (Desktop) */}
        <div className="hidden xl:flex items-end">
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="h-11 w-full rounded-xl gap-2 text-[11px] font-bold uppercase tracking-widest border-white/[0.08] hover:bg-white/[0.04] transition-all" 
            disabled={!hasFilters}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", hasFilters && "animate-spin-slow")} />
            Reset Insights
          </Button>
        </div>
      </div>
    </div>
  );
}
