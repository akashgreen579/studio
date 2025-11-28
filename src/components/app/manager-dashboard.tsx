"use client";

import { useState } from "react";
import type { User, Project, AuditLogEntry, Permissions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateProjectWizard } from "./create-project-wizard";
import { ProjectSummaryCard } from "./project-summary-card";
import { AuditLog } from "./audit-log";
import { allUsers } from "@/lib/data";

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
    entry: Omit<AuditLogEntry, "id" | "timestamp">
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
        <Button onClick={() => setIsWizardOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </div>
      <div className="grid gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">My Projects</h3>
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
