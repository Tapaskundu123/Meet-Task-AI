'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, PlusCircle, Users, CheckSquare, 
  Bot, Sparkles, Activity, ShieldCheck, Cpu 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/upload',
    label: 'New Session',
    icon: PlusCircle,
  },
  {
    href: '/meetings',
    label: 'Intel Archive',
    icon: Users,
  },
  {
    href: '/tasks',
    label: 'Objectives',
    icon: CheckSquare,
  },
  {
    href: '/agent',
    label: 'AI Agent',
    icon: Bot,
    badge: 'LIVE',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar flex flex-col h-screen border-r border-white/5 bg-black/45 backdrop-blur-3xl sticky top-0 z-50 w-[300px] min-w-[300px]">
      {/* Premium Logo Header */}
      <div className="px-10 py-12">
        <div className="flex items-center gap-5 group">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tighter text-foreground group-hover:text-primary transition-colors">inSIGHTS</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Core Intelligence</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-5 space-y-2.5">
        <div className="px-5 py-4 flex items-center justify-between mb-4">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 whitespace-nowrap">Intelligence Center</span>
           <Activity className="h-4 w-4 text-muted-foreground/20" />
        </div>
        
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative w-full",
                active 
                  ? "bg-primary/10 text-primary border-l-4 border-primary/40 pl-7" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {active && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_20px_rgba(var(--primary),0.8)] z-10" />
              )}
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-300",
                active ? "scale-110" : "group-hover:scale-110 opacity-60"
              )} />
              <span className={cn(
                "text-sm font-bold tracking-tight",
                active ? "text-primary-foreground" : ""
              )}>
                {item.label}
              </span>
              {item.badge && (
                <Badge className="ml-auto bg-primary text-black font-black text-[9px] tracking-widest border-none shadow-lg shadow-primary/20 animate-pulse">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-10 border-t border-white/5 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantum Synced</span>
        </div>
        
        <Card className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 p-5 rounded-3xl shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-colors" />
           <div className="flex items-center gap-4 relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg group-hover:scale-110 transition-transform">
                 <Cpu className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[11px] font-black text-foreground tracking-tight">DeepSeek-V3 Engine</span>
                 <span className="text-[10px] font-bold text-muted-foreground opacity-60">O1 Vision Enabled</span>
              </div>
           </div>
        </Card>
      </div>
    </aside>
  );
}
