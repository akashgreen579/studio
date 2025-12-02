
"use client";

import type { User, Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  FileClock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Loader,
  Bell,
  FlaskConical,
  ArrowRight,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { notifications, draftAutomations as initialDraftAutomations } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";


interface EmployeeDashboardProps {
  user: User;
  projects: Project[];
}

const summaryCards = [
    { title: "Completed Scripts", value: "12", icon: FileText, change: "+2 this week" },
    { title: "Draft Automations", value: "3", icon: FileClock, change: "1 needs review" },
    { title: "Pipelines Passed", value: "89%", icon: CheckCircle2, change: "-1.2% vs last week" },
];

const pipelineHistory = [
    { id: 'pipe-1', name: "Regression Suite", status: "Passed", duration: "5m 21s", timestamp: new Date(Date.now() - 7200000) },
    { id: 'pipe-2', name: "Smoke Tests", status: "Failed", duration: "1m 10s", timestamp: new Date(Date.now() - 86400000) },
    { id: 'pipe-3', name: "Nightly Build", status: "Passed", duration: "12m 45s", timestamp: new Date(Date.now() - 86400000 * 2) },
    { id: 'pipe-4', name: "Hotfix Validation", status: "Running", duration: "...", timestamp: new Date() },
];


const getStatusIcon = (status: string) => {
    switch (status) {
        case "Passed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case "Failed": return <XCircle className="h-4 w-4 text-red-500" />;
        case "Running": return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
        default: return null;
    }
};

export function EmployeeDashboard({ user, projects }: EmployeeDashboardProps) {
  const [draftAutomations, setDraftAutomations] = useState(initialDraftAutomations);
  const router = useRouter();

  const handleContinueDraft = (draft: any) => {
    // This would navigate to the TestAI lab and load the specific draft state
    router.push(`/test-ai-lab?draftId=${draft.id}`);
  };


  return (
    <div className="grid gap-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/test-ai-lab')}><FlaskConical className="mr-2 h-4 w-4"/> Open TestAI Lab</Button>
                <Button>Trigger Pipeline <PlayCircle className="ml-2 h-4 w-4"/></Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card, i) => (
                <Card key={card.title} className="hover:shadow-lg transition-shadow animate-in fade-in-0" style={{animationDelay: `${i * 100}ms`, animationFillMode: 'backwards'}}>
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

        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Draft Automations</CardTitle>
                    <CardDescription>Your recent work-in-progress test automations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {draftAutomations.length > 0 ? (
                        <div className="space-y-4">
                            {draftAutomations.map(draft => (
                                <Card key={draft.id} className="p-4 flex justify-between items-center group hover:bg-muted/50 transition-colors">
                                    <div>
                                        <p className="font-semibold">{draft.name} <span className="font-normal text-muted-foreground">({draft.project})</span></p>
                                        <p className="text-xs text-muted-foreground">Last updated {formatDistanceToNow(draft.updated, { addSuffix: true })}</p>
                                        <Badge variant="secondary" className="mt-2">{draft.status}</Badge>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleContinueDraft(draft)}>
                                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                            <FileClock className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Drafts Yet</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Start automating a test case in the TestAI Lab.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                     <Tabs defaultValue="pipelines" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications <Badge className="ml-2">{notifications.filter(n=>!n.read).length}</Badge></TabsTrigger>
                        </TabsList>
                        <TabsContent value="pipelines" className="mt-4">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Run</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pipelineHistory.map(run => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-medium">{run.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(run.status)}
                                                    <span>{run.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{run.duration}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{formatDistanceToNow(run.timestamp, { addSuffix: true })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        <TabsContent value="notifications" className="mt-4 max-h-64 overflow-y-auto">
                           <div className="space-y-3 pr-2">
                                {notifications.map(note => (
                                    <div key={note.id} className={`flex items-start gap-3 p-3 rounded-lg ${!note.read ? 'bg-accent/10' : 'bg-transparent'}`}>
                                        <Bell className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm">{note.text}</p>
                                            <p className="text-xs text-muted-foreground">{note.category}</p>
                                        </div>
                                        {!note.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
                                    </div>
                                ))}
                           </div>
                        </TabsContent>
                    </Tabs>
                </CardHeader>
            </Card>
        </div>
    </div>
  );
}

    
