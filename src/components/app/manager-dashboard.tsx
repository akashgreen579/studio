
"use client";

import { useState } from "react";
import type { User, Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users as UsersIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamOverview } from "./team-overview";
import { EmployeeDashboard } from "./employee-dashboard";
import type { ActiveView } from "@/app/dashboard/page";
import { allUsers } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";

interface ManagerDashboardProps {
  user: User;
  projects: Project[];
  teamMembers: User[];
  setActiveView: (view: ActiveView) => void;
}

export function ManagerDashboard({
  user,
  projects,
  teamMembers,
  setActiveView,
}: ManagerDashboardProps) {
  const [viewMode, setViewMode] = useState<"team" | string>("team");

  const selectedUser = allUsers.find(u => u.id === viewMode);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
            <p className="text-muted-foreground mt-1">{viewMode === 'team' ? "Team-wide performance and approvals." : `Viewing dashboard for ${selectedUser?.name}`}</p>
        </div>
        <div className="flex items-center gap-4">
            <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select a view" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="team">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4" />
                            Team Overview
                        </div>
                    </SelectItem>
                    {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                           {member.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => setActiveView('project-settings')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Project
            </Button>
        </div>
      </div>
      
        <AnimatePresence mode="wait">
            <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {viewMode === "team" ? (
                    <TeamOverview teamMembers={teamMembers} projects={projects} />
                ) : (
                    selectedUser && <EmployeeDashboard user={selectedUser} projects={projects.filter(p => p.members.some(m => m.id === selectedUser.id))} />
                )}
            </motion.div>
        </AnimatePresence>
    </div>
  );
}
