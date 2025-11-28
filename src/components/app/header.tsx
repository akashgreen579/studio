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

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  user: User;
}

export function Header({ currentRole, onRoleChange, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <TestTubeDiagonal className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold text-foreground">TestCraft AI</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Viewing as:
          </span>
          <Select
            value={currentRole}
            onValueChange={(value) => onRoleChange(value as Role)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
