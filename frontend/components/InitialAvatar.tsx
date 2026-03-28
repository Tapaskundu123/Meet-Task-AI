'use client';

import { cn } from "@/lib/utils";

interface InitialAvatarProps {
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export default function InitialAvatar({ name, className, size = "md" }: InitialAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Generate a consistent gradient based on the name length
  const gradients = [
    "from-blue-500/40 to-indigo-600/40",
    "from-purple-500/40 to-pink-600/40",
    "from-emerald-500/40 to-teal-600/40",
    "from-orange-500/40 to-red-600/40",
    "from-cyan-500/40 to-blue-600/40",
  ];
  
  const gradientIndex = name.length % gradients.length;
  const activeGradient = gradients[gradientIndex];

  const sizeClasses = {
    xs: "h-5 w-5 text-[8px]",
    sm: "h-7 w-7 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-base",
  };

  return (
    <div className={cn(
      "rounded-2xl flex items-center justify-center font-black transition-all duration-300",
      "bg-gradient-to-br border border-white/10 shadow-lg shadow-black/20",
      "text-white select-none relative overflow-hidden group",
      activeGradient,
      sizeClasses[size],
      className
    )}>
      {/* Gloss overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Initials */}
      <span className="relative z-10 drop-shadow-md">
        {initials || '?'}
      </span>
      
      {/* Bottom ring */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/20" />
    </div>
  );
}
