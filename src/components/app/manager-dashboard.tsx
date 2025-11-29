

"use client";

import { useState } from "react";
import type { User, Project, AuditLogEntry, Permissions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight } from "lucide-react";
import { CreateProjectWizard } from "./create-project-wizard";
import { ProjectSummaryCard } from "./project-summary-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import type { ActiveView } from "@/app/dashboard/page";

interface ManagerDashboardProps {
  user: User;
  projects: Project[];
  auditLog: AuditLogEntry[];
  addProject: (
    newProject: Omit<Project, "id" | "owner" | "lastUpdated">
  ) => void;
  updateProjectPermissions: (
    projectId: string,
    permissions: Record<string, Partial<Permissions>>
  ) => void;
  addAuditLogEntry: (
    entry: Omit<AuditLogEntry, "id" | "timestamp" | "impact">
  ) => void;
  setActiveView: (view: ActiveView) => void;
}

export function ManagerDashboard({
  user,
  projects,
  auditLog,
  addProject,
  updateProjectPermissions,
  setActiveView,
}: ManagerDashboardProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Project Settings</h1>
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
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectSummaryCard
                key={project.id}
                project={project}
                currentUser={user}
                updateProjectPermissions={updateProjectPermissions}
              />
            ))
          ) : (
             <div className="col-span-full text-center py-12 px-6 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No projects created yet.</p>
                <Button variant="link" className="mt-2" onClick={() => setIsWizardOpen(true)}>Create your first project</Button>
            </div>
          )}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A summary of recent administrative actions across all projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {auditLog.slice(0, 3).map(log => (
                         <li key={log.id} className="flex justify-between">
                            <span>{log.action}: "{log.details}" by {log.user.name}</span>
                            <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                         </li>
                    ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveView('audit-log')}>
                    View Full Audit Log <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
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
