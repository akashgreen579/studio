
"use client";

import type { Role } from "@/app/page";
import type { User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TestTubeDiagonal } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  user: User;
}

export function Header({ currentRole, onRoleChange, user }: HeaderProps) {
  return (
    <header className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 transition-colors"
    )}>
      {/* Search, Breadcrumbs, etc. can go here */}
      <div className="ml-auto flex items-center gap-4">
        <p className="text-sm">Welcome back, <span className="font-semibold">{user.name}</span>!</p>
      </div>
    </header>
  );
}
