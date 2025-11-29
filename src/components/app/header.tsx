
"use client";

import type { User } from "@/lib/data";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 sm:h-auto sm:border-0 sm:bg-transparent"
    )}>
      <div className="ml-auto flex items-center gap-4">
        <p className="text-sm">
          Welcome back, <span className="font-semibold">{user.name}</span>!
        </p>
      </div>
    </header>
  );
}
