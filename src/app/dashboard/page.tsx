"use client";

import { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { Header } from "@/components/app/header";
import { ManagerDashboard } from "@/components/app/manager-dashboard";
import { EmployeeDashboard } from "@/components/app/employee-dashboard";
import { UserManagement } from "@/components/app/user-management";
import { TMTView } from "@/components/app/tmt-view";
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
import { AuditLogScreen } from "@/components/app/audit-log-screen";
import { ApprovalInbox } from "@/components/app/approval-inbox";
import { ProjectSettings } from "@/components/app/project-settings";
import TestAiLabPage from "@/app/test-ai-lab/page";
import { PipelinesView } from "@/components/app/pipelines-view";


export type Role = "manager" | "employee";
export type ActiveView = "dashboard" | "project-settings" | "user-management" | "audit-log" | "approvals" | "tmt-view" | "test-ai-lab" | "pipelines" | null;

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as Role || 'employee';
  const initialView = searchParams.get('view') as ActiveView || 'dashboard';

  const { toast } = useToast();
  const [role, setRole] = useState<Role>(initialRole);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initialAuditLog);
  const [lastCreatedProject, setLastCreatedProject] = useState<Project | null>(
    null
  );
  const [activeView, setActiveView] = useState<ActiveView>(initialView);

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.role === role)!;
  }, [role]);
  
  const teamMembers = useMemo(() => {
    if (currentUser.role === 'manager') {
      return allUsers.filter(u => u.role === 'employee');
    }
    return [];
  }, [currentUser]);

  const addAuditLogEntry = useCallback(
    (entry: Omit<AuditLogEntry, "id" | "timestamp" | "impact">) => {
      let impact: "Low" | "Medium" | "High" = "Low";
      if (entry.action.includes("Created project")) impact = "High";
      if (entry.action.includes("Updated permissions")) impact = "Medium";
      if (entry.action.includes("Approved") || entry.action.includes("Denied")) impact = "Medium";

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
    (projectId: string, newPermissions: Record<string, Partial<Permissions>>) => {
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === projectId) {
            const updatedProject = {
              ...p,
              permissions: { ...p.permissions, ...newPermissions }, // Deep merge permissions
              lastUpdated: new Date(),
            };
             // Add new members if they don't exist
            const existingMemberIds = p.members.map(m => m.id);
            const newMemberIds = Object.keys(newPermissions);
            const membersToAdd = newMemberIds
              .filter(id => !existingMemberIds.includes(id))
              .map(id => allUsers.find(u => u.id === id))
              .filter((u): u is User => !!u);
            
            if (membersToAdd.length > 0) {
               updatedProject.members = [...p.members, ...membersToAdd];
               membersToAdd.forEach(member => {
                 addAuditLogEntry({
                   user: currentUser,
                   action: `Assigned member to "${p.name}"`,
                   details: `${member.name} was added to the project.`,
                 });
               });
            }
            
            // Remove members if they are no longer in permissions
            const memberIdsInNewPerms = Object.keys(newPermissions);
            updatedProject.members = updatedProject.members.filter(m => memberIdsInNewPerms.includes(m.id));


            addAuditLogEntry({
              user: currentUser,
              action: `Updated permissions for "${p.name}"`,
              details: `Changed permissions for project members.`,
            });
            return updatedProject;
          }
          return p;
        })
      );
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
    teamMembers,
    setActiveView,
  };
  const employeeProps = { user: currentUser, projects };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return role === "manager" ? (
          <ManagerDashboard {...managerProps} />
        ) : (
          <EmployeeDashboard {...employeeProps} />
        );
       case 'tmt-view':
        return <TMTView user={currentUser} />;
      case 'test-ai-lab':
        return <TestAiLabPage />;
      case 'pipelines':
        return <PipelinesView user={currentUser} />;
      case 'project-settings':
        return role === "manager" ? (
          <ProjectSettings
            projects={projects}
            user={currentUser}
            addProject={addProject}
            updateProjectPermissions={updateProjectPermissions}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground rounded-lg border-2 border-dashed">
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p>You do not have permission to view this page.</p>
          </div>
        );
      case 'user-management':
        return role === "manager" ? (
          <UserManagement />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground rounded-lg border-2 border-dashed">
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p>You do not have permission to view this page.</p>
          </div>
        );
      case 'audit-log':
        return role === "manager" ? (
          <AuditLogScreen log={auditLog} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground rounded-lg border-2 border-dashed">
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p>You do not have permission to view this page.</p>
          </div>
        );
      case 'approvals':
        return role === "manager" ? (
          <ApprovalInbox />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground rounded-lg border-2 border-dashed">
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p>You do not have permission to view this page.</p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground rounded-lg border-2 border-dashed">
            <PlaceholderHome className="h-16 w-16 mb-4"/>
            <h2 className="text-2xl font-semibold">Welcome to TestCraft AI</h2>
            <p>Select an item from the sidebar to get started.</p>
          </div>
        );
    }
  }

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
          {renderActiveView()}
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
