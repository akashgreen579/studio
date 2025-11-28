
"use client";

import { useState } from "react";
import type { User, Project, AuditLogEntry, Permissions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateProjectWizard } from "./create-project-wizard";
import { ProjectSummaryCard } from "./project-summary-card";
import { AuditLog } from "./audit-log";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ManagerDashboardProps {
  user: User;
  projects: Project[];
  auditLog: AuditLogEntry[];
  addProject: (
    newProject: Omit<Project, "id" | "owner" | "lastUpdated">
  ) => void;
  updateProjectPermissions: (
    projectId: string,
    permissions: Record<string, Permissions>
  ) => void;
  addAuditLogEntry: (
    entry: Omit<AuditLogEntry, "id" | "timestamp" | "impact">
  ) => void;
}

export function ManagerDashboard({
  user,
  projects,
  auditLog,
  addProject,
  updateProjectPermissions,
}: ManagerDashboardProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manager Dashboard</h2>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={() => setIsWizardOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Project
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Only Managers can create new projects.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
      <div className="grid gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Managed Projects</h3>
          {projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectSummaryCard
                  key={project.id}
                  project={project}
                  currentUser={user}
                  updateProjectPermissions={updateProjectPermissions}
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No projects created yet.</p>
                <Button variant="link" className="mt-2" onClick={() => setIsWizardOpen(true)}>Create your first project</Button>
            </div>
          )}
        </div>
        <AuditLog log={auditLog} />
      </div>
      <CreateProjectWizard
        isOpen={isWizardOpen}
        setIsOpen={setIsWizardOpen}
        addProject={addProject}
        currentUser={user}
        existingProjectNames={projects.map(p => p.name)}
      />
    </>
  );
}
