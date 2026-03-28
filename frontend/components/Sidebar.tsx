'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, PlusCircle, Users, CheckSquare,
  Bot, Sparkles, Activity, Cpu, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & stats',
  },
  {
    href: '/upload',
    label: 'New Session',
    icon: PlusCircle,
    description: 'Process meeting',
  },
  {
    href: '/meetings',
    label: 'Intel Archive',
    icon: Users,
    description: 'Past meetings',
  },
  {
    href: '/tasks',
    label: 'Objectives',
    icon: CheckSquare,
    description: 'All action items',
  },
  {
    href: '/agent',
    label: 'AI Agent',
    icon: Bot,
    badge: 'LIVE',
    description: 'LangGraph agent',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar flex h-screen w-[280px] min-w-[280px] flex-col border-r border-white/[0.06] bg-[oklch(0.09_0.02_240)] sticky top-0 z-50 overflow-hidden">
      
      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      
      {/* Ambient glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo / Brand */}
      <div className="relative px-6 pt-8 pb-7">
        <div className="flex items-center gap-3.5">
          <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/80 to-primary/30 flex items-center justify-center shadow-lg shadow-primary/20 border border-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[18px] tracking-tight text-white leading-none">MeetAI</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70 mt-0.5">Core Intelligence</span>
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-6 mb-2">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground/50">
            Navigation
          </span>
          <Activity className="h-3.5 w-3.5 text-muted-foreground/30" />
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group w-full',
                active
                  ? 'bg-primary/15 border border-primary/25 shadow-sm shadow-primary/10'
                  : 'border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
              )}
            >
              {/* Active accent bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-primary rounded-r-full shadow-[0_0_8px_rgba(100,130,255,0.6)]" />
              )}

              {/* Icon container */}
              <div className={cn(
                'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                active
                  ? 'bg-primary/20 shadow-inner shadow-primary/10'
                  : 'bg-white/[0.04] group-hover:bg-white/[0.07]'
              )}>
                <item.icon className={cn(
                  'h-4 w-4 transition-all duration-200',
                  active ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground/80'
                )} />
              </div>

              {/* Label + description */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className={cn(
                  'text-[13px] font-semibold leading-none tracking-tight',
                  active ? 'text-foreground' : 'text-muted-foreground/80 group-hover:text-foreground'
                )}>
                  {item.label}
                </span>
                <span className="text-[10px] text-muted-foreground/40 mt-0.5 leading-none tracking-wide">
                  {item.description}
                </span>
              </div>

              {/* Badge or chevron */}
              {item.badge ? (
                <span className="ml-auto flex-shrink-0 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase">
                  {item.badge}
                </span>
              ) : active ? (
                <ChevronRight className="h-3.5 w-3.5 text-primary/50 ml-auto flex-shrink-0" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 border-t border-white/[0.06]" />

      {/* Footer */}
      <div className="px-5 py-6 space-y-3.5">
        {/* Status pill */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-green-500/[0.08] border border-green-500/20">
          <div className="relative flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-400/80">System Online</span>
        </div>

        {/* Model card */}
        <div className="flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-orange-500/20 flex-shrink-0">
            <Cpu className="h-4.5 w-4.5 text-orange-400" style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-bold text-foreground/90 tracking-tight leading-none">DeepSeek-V3</span>
            <span className="text-[10px] text-muted-foreground/50 mt-0.5 leading-none">Vision enabled</span>
          </div>
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
