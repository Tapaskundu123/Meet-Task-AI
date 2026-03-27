'use client';

import { cn } from "@/lib/utils";

interface InitialAvatarProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function InitialAvatar({ name, className, size = "md" }: InitialAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  return (
    <div className={cn(
      "rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-bold text-primary-foreground/90 flex-shrink-0 shadow-inner select-none",
      sizeClasses[size],
      className
    )}>
      {initials || '?'}
    </div>
  );
}
