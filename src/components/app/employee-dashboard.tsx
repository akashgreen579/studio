"use client";

import type { User, Project } from "@/lib/data";
import { EmployeeProjectCard } from "./employee-project-card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { UserCheck } from "lucide-react";

interface EmployeeDashboardProps {
  user: User;
  projects: Project[];
}

export function EmployeeDashboard({ user, projects }: EmployeeDashboardProps) {
  const assignedProjects = projects.filter((project) =>
    project.members.some((member) => member.id === user.id)
  );

  return (
    <div className="grid gap-8">
       <Alert variant="default" className="bg-muted/50 border-teal-500/30 text-teal-800">
          <UserCheck className="h-4 w-4 !text-teal-700" />
          <AlertTitle className="text-teal-900">Employee View</AlertTitle>
          <AlertDescription>
            You are viewing the dashboard as an employee. Management actions are restricted.
          </AlertDescription>
        </Alert>
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Your Projects</h2>
        {assignedProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedProjects.map((project) => (
              <EmployeeProjectCard
                key={project.id}
                project={project}
                user={user}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <h3 className="text-xl font-semibold">No Projects Assigned</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven't been assigned to any projects yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
