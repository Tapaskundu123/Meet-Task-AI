'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal } from 'lucide-react';

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
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">Filters</span>
      </div>

      <Select value={status || 'all'} onValueChange={(v: string | null) => onStatusChange(v === 'all' || !v ? '' : v)}>
        <SelectTrigger className="h-9 w-[140px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priority || 'all'} onValueChange={(v: string | null) => onPriorityChange(v === 'all' || !v ? '' : v)}>
        <SelectTrigger className="h-9 w-[140px] text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Input
        className="h-9 w-[140px] text-xs"
        placeholder="Filter by owner..."
        value={owner}
        onChange={e => onOwnerChange(e.target.value)}
      />

      <Input
        className="h-9 w-[140px] text-xs"
        placeholder="Filter by member..."
        value={member}
        onChange={e => onMemberChange(e.target.value)}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9 gap-1.5 text-xs">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
