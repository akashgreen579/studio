

"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/app/header";
import { ManagerDashboard } from "@/components/app/manager-dashboard";
import { EmployeeDashboard } from "@/components/app/employee-dashboard";
import {
  users as initialUsers,
  projects as initialProjects,
  auditLog as initialAuditLog,
  allUsers,
} from "@/lib/data";
import type { User, Project, AuditLogEntry, Permissions } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { ProjectCreationConfirmation } from "@/components/app/project-creation-confirmation";
import { Sidebar } from "@/components/app/sidebar";
import { Home as PlaceholderHome } from "lucide-react";

export type Role = "manager" | "employee";
export type ActiveView = "dashboard" | "project-settings" | null;

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as Role || 'employee';

  const { toast } = useToast();
  const [role, setRole] = useState<Role>(initialRole);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initialAuditLog);
  const [lastCreatedProject, setLastCreatedProject] = useState<Project | null>(
    null
  );
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.role === role)!;
  }, [role]);

  const addAuditLogEntry = useCallback(
    (entry: Omit<AuditLogEntry, "id" | "timestamp" | "impact">) => {
      let impact: "Low" | "Medium" | "High" = "Low";
      if (entry.action.includes("Created project")) impact = "High";
      if (entry.action.includes("Updated permissions")) impact = "Medium";

      setAuditLog((prev) => [
        {
          id: `log${prev.length + 1}`,
          timestamp: new Date(),
          impact,
          ...entry,
        },
        ...prev,
      ]);
    },
    []
  );

  const addProject = useCallback(
    (newProjectData: Omit<Project, "id" | "owner" | "lastUpdated">) => {
      const newProject: Project = {
        ...newProjectData,
        id: `proj${projects.length + 1}`,
        owner: currentUser,
        lastUpdated: new Date(),
      };
      setProjects((prev) => [newProject, ...prev]);
      addAuditLogEntry({
        user: currentUser,
        action: `Created project "${newProject.name}"`,
        details: `Assigned to ${newProject.members.length} member(s).`,
      });

      setLastCreatedProject(newProject);
      setActiveView(null);
    },
    [projects.length, currentUser, addAuditLogEntry]
  );

  const updateProjectPermissions = useCallback(
    (projectId: string, newPermissions: Record<string, Permissions>) => {
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === projectId) {
            addAuditLogEntry({
              user: currentUser,
              action: `Updated permissions for "${p.name}"`,
              details: `Changed permissions for project members.`,
            });
            return {
              ...p,
              permissions: newPermissions,
              lastUpdated: new Date(),
            };
          }
          return p;
        })
      );
      toast({
        title: "Permissions Updated",
        description: "Project permissions have been saved.",
      });
    },
    [currentUser, addAuditLogEntry, toast]
  );
  
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setActiveView("dashboard");
    const newUser = allUsers.find((u) => u.role === newRole)!;
    toast({
      title: "Switched Role",
      description: `You are now viewing the dashboard as ${newUser.name} (${newRole}).`,
    });
  };

  const handleMenuClick = (view: ActiveView) => {
    setActiveView(view);
  };


  if (lastCreatedProject && activeView === null) {
    return (
      <ProjectCreationConfirmation
        project={lastCreatedProject}
        onContinue={() => {
          setLastCreatedProject(null);
          setActiveView('dashboard');
        }}
      />
    );
  }

  const managerProps = {
    user: currentUser,
    projects,
    auditLog,
    addProject,
    updateProjectPermissions,
    addAuditLogEntry,
  };
  const employeeProps = { user: currentUser, projects };

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar
        currentRole={role}
        onRoleChange={handleRoleChange}
        user={currentUser}
        activeView={activeView}
        onMenuClick={handleMenuClick}
      />
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <Header user={currentUser} />
        <main className="flex-1 grid gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {activeView === 'project-settings' ? (
            role === "manager" ? (
              <ManagerDashboard {...managerProps} />
            ) : (
              <EmployeeDashboard {...employeeProps} />
            )
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground rounded-lg border-2 border-dashed">
                <PlaceholderHome className="h-16 w-16 mb-4"/>
                <h2 className="text-2xl font-semibold">Welcome to TestCraft AI</h2>
                <p>Select an item from the sidebar to get started.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
