"use client";

import { useState, useMemo, useCallback } from "react";
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

export type Role = "manager" | "employee";

export default function Home() {
  const { toast } = useToast();
  const [role, setRole] = useState<Role>("manager");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initialAuditLog);

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.role === role)!;
  }, [role]);

  const addAuditLogEntry = useCallback(
    (entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
      setAuditLog((prev) => [
        {
          id: `log${prev.length + 1}`,
          timestamp: new Date(),
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
      toast({
        title: "Project Created",
        description: `Project '${newProject.name}' created and assigned to ${newProject.members.length} members.`,
      });
      newProject.members.forEach((member) => {
        if (member.id !== currentUser.id) {
          toast({
            title: "Added to Project",
            description: `You were added to ${newProject.name} by ${currentUser.name}.`,
          });
        }
      });
    },
    [projects.length, currentUser, addAuditLogEntry, toast]
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
            return { ...p, permissions: newPermissions, lastUpdated: new Date() };
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
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <Header
        currentRole={role}
        onRoleChange={(newRole) => {
          setRole(newRole);
          const newUser = allUsers.find((u) => u.role === newRole)!;
          toast({
            title: "Switched Role",
            description: `You are now viewing the dashboard as ${newUser.name} (${newRole}).`,
          });
        }}
        user={currentUser}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {role === "manager" ? (
          <ManagerDashboard {...managerProps} />
        ) : (
          <EmployeeDashboard {...employeeProps} />
        )}
      </main>
    </div>
  );
}
