
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
                    <CardDescription>A summary of all active testing projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    {projects.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{project.name}</CardTitle>
                                    <CardDescription className="h-10 line-clamp-2">{project.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {project.members.slice(0, 5).map(member => (
                                            <div key={member.id} className="h-8 w-8 rounded-full border-2 border-background bg-muted text-xs font-medium flex items-center justify-center">
                                                {member.name.charAt(0)}
                                            </div>
                                        ))}
                                        {project.members.length > 5 && (
                                            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted text-xs font-medium border-2 border-background">
                                                +{project.members.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardContent>
                                    <Button variant="outline" size="sm" onClick={() => setActiveView('project-settings')}>
                                        Manage Project
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No projects created yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

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
    </div>
  );
}
