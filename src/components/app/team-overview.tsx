
"use client";

import { BarChart, FileCheck, Users, CheckCheck, FolderKanban, GitMerge, FileClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { mockRequests } from "@/lib/data";
import type { User, Project } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface TeamOverviewProps {
    teamMembers: User[];
    projects: Project[];
}

const teamSummaryCards = [
    { title: "Total Projects", value: "12", icon: FileCheck },
    { title: "Active Team Members", value: "4", icon: Users },
    { title: "Pending Approvals", value: "3", icon: CheckCheck },
    { title: "Team Success Rate (7d)", value: "94%", icon: BarChart },
];

const teamPerformanceData = [
    { name: "Samira Khan", avatar: "https://i.pravatar.cc/150?u=samira.khan@example.com", completed: 12, drafts: 2, successRate: "98%", pending: 1 },
    { name: "John Doe", avatar: "https://i.pravatar.cc/150?u=john.doe@example.com", completed: 8, drafts: 4, successRate: "91%", pending: 0 },
    { name: "Jane Smith", avatar: "https://i.pravatar.cc/150?u=jane.smith@example.com", completed: 15, drafts: 1, successRate: "99%", pending: 2 },
    { name: "Peter Jones", avatar: "https://i.pravatar.cc/150?u=peter.jones@example.com", completed: 5, drafts: 0, successRate: "85%", pending: 0 },
]

const getApprovalIcon = (type: string) => {
    switch (type) {
        case "Access Request": return <CheckCheck className="h-4 w-4" />;
        case "Merge Request": return <GitMerge className="h-4 w-4" />;
        case "Folder Creation": return <FolderKanban className="h-4 w-4" />;
        default: return <FileClock className="h-4 w-4" />;
    }
};

export function TeamOverview({ teamMembers, projects }: TeamOverviewProps) {
    return (
        <div className="grid gap-8">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {teamSummaryCards.map(card => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Team Performance</CardTitle>
                        <CardDescription>An overview of your team's automation activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Completed</TableHead>
                                    <TableHead>Drafts</TableHead>
                                    <TableHead>Success Rate</TableHead>
                                    <TableHead>Pending Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teamPerformanceData.map(member => (
                                <TableRow key={member.name}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={member.avatar} data-ai-hint="person face"/>
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.completed}</TableCell>
                                    <TableCell>{member.drafts}</TableCell>
                                    <TableCell><Badge variant="outline">{member.successRate}</Badge></TableCell>
                                    <TableCell>{member.pending}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                         <div className="flex justify-between items-center">
                            <CardTitle>Approvals</CardTitle>
                            <Badge variant="destructive">3 Pending</Badge>
                         </div>
                        <CardDescription>Review pending requests from your team.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockRequests.map(req => (
                            <div key={req.id} className="flex items-start gap-4">
                                <div className="bg-muted p-2 rounded-full mt-1">
                                    {getApprovalIcon(req.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{req.user} <span className="font-normal text-muted-foreground">requests {req.type}</span></p>
                                    <p className="text-sm text-muted-foreground">{req.project}</p>
                                    <div className="mt-2 flex gap-2">
                                        <Button size="sm" variant="outline">View</Button>
                                        <Button size="sm">Approve</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full">View All Approvals</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
