
"use client";

import { useState } from "react";
import type { User, Project, AuditLogEntry, Permissions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight, BarChart, Users, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { ProjectSummaryCard } from "./project-summary-card";
import type { ActiveView } from "@/app/dashboard/page";

interface ManagerDashboardProps {
  user: User;
  projects: Project[];
  auditLog: AuditLogEntry[];
  setActiveView: (view: ActiveView) => void;
  updateProjectPermissions: (
    projectId: string,
    permissions: Record<string, Partial<Permissions>>
  ) => void;
}

const summaryCards = [
    { title: "Total Projects", value: "12", icon: FileCheck, change: "+2 this month" },
    { title: "Active Users", value: "23", icon: Users, change: "+3 this week" },
    { title: "Success Rate (24h)", value: "92%", icon: BarChart, change: "-2.1% vs last week" },
];


export function ManagerDashboard({
  user,
  projects,
  auditLog,
  setActiveView,
  updateProjectPermissions,
}: ManagerDashboardProps) {

  return (
    <div className="grid gap-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
            <Button onClick={() => setActiveView('project-settings')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Project
            </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {summaryCards.map(card => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Projects Overview</CardTitle>
                    <CardDescription>A summary of all active testing projects you own or manage.</CardDescription>
                </CardHeader>
                <CardContent>
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
                            <h3 className="text-lg font-medium">No Projects Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                               Get started by creating a new project.
                            </p>
                             <Button variant="link" className="mt-2" onClick={() => setActiveView('project-settings')}>Create your first project</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
