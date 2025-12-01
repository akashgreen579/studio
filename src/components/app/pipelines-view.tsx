
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PlusCircle, Play, Settings, BarChart3, CheckCircle2, XCircle, Loader, Clock, GitBranch, Bell, Trash2, Calendar, Link } from "lucide-react";
import { projects, pipelines, pipelineTemplates, type User, getEffectivePermissions, type Permissions } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ExecutionView } from "./execution-view";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

interface PipelinesViewProps {
  user: User;
}

const getStatusIcon = (status: string) => {
    const className = "h-4 w-4 mr-2";
    switch(status) {
        case "Passed": return <CheckCircle2 className={cn(className, "text-green-500")} />;
        case "Failed": return <XCircle className={cn(className, "text-red-500")} />;
        case "Running": return <Loader className={cn(className, "animate-spin text-blue-500")} />;
        case "Scheduled": return <Clock className={cn(className, "text-amber-500")} />;
        default: return null;
    }
}

export function PipelinesView({ user }: PipelinesViewProps) {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const permissions = getEffectivePermissions(user.id);
  
  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId) || pipelineTemplates.find(p => p.id === selectedPipelineId);
  const isRunning = selectedPipeline?.lastRun?.status === 'Running';


  const ManagerActionButton = ({ permission, tooltip, children, className, onClick, asChild, disabled }: { permission: keyof (Permissions), tooltip: string, children: React.ReactNode, className?: string, onClick?: () => void, asChild?: boolean, disabled?: boolean }) => {
        const hasPermission = permissions[permission];
        const isDisabled = !hasPermission || disabled;
        
        const buttonContent = (
            <Button variant="outline" className={className} disabled={isDisabled} onClick={onClick} asChild={asChild}>
                {children}
            </Button>
        );

        if (hasPermission) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                        <TooltipContent><p>{tooltip}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        
        return (
             <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild><div tabIndex={0}>{buttonContent}</div></TooltipTrigger>
                    <TooltipContent><p>You do not have permission for this action.</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

  if (isRunning && selectedPipeline) {
    return <ExecutionView pipeline={selectedPipeline} onBack={() => setSelectedPipelineId(null)}/>
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Execution &amp; Pipelines</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="proj1">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="qa">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qa">QA Environment</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
            </SelectContent>
          </Select>
          <ManagerActionButton permission="runPipelines" tooltip="Create a new execution pipeline.">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Pipeline
          </ManagerActionButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 flex-grow">
        {/* Left Panel: Pipeline List */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search pipelines..." className="pl-8" />
            </div>
          </CardHeader>
          <Tabs defaultValue="active" className="flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mx-6">
              <TabsTrigger value="active">Active Pipelines</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <CardContent className="p-0 flex-grow">
              <TabsContent value="active" className="m-0 h-full">
                <div className="space-y-2 p-4">
                  {pipelines.map(p => (
                    <div
                      key={p.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer border-l-4 transition-colors",
                        selectedPipelineId === p.id 
                            ? "bg-primary/10 border-primary" 
                            : "border-transparent hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedPipelineId(p.id)}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{p.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                            {getStatusIcon(p.lastRun.status)}
                            {p.lastRun.status}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last run {formatDistanceToNow(p.lastRun.timestamp, { addSuffix: true })} by {p.lastRun.triggeredBy}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="templates" className="m-0">
                 <div className="space-y-2 p-4">
                  {pipelineTemplates.map(p => (
                     <div
                      key={p.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer border-l-4 transition-colors",
                         selectedPipelineId === p.id 
                            ? "bg-primary/10 border-primary" 
                            : "border-transparent hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedPipelineId(p.id)}
                    >
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
        
        {/* Right Panel: Details */}
        <Card>
            {selectedPipeline ? (
                <>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                        <CardTitle className="text-xl">{selectedPipeline.name}</CardTitle>
                        <CardDescription>{selectedPipeline.description}</CardDescription>
                        </div>
                         <div className="flex gap-2">
                             <ManagerActionButton permission="runPipelines" tooltip="Save changes to this pipeline.">
                                <Settings className="mr-2 h-4 w-4"/>Save
                             </ManagerActionButton>
                              <Button>
                                <Play className="mr-2 h-4 w-4"/>Run Now
                              </Button>
                         </div>
                    </div>
                </CardHeader>
                <Tabs defaultValue="summary" className="flex-grow flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 mx-6">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="runs">Runs</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <CardContent className="mt-4">
                    <TabsContent value="summary">
                        <p className="text-muted-foreground">A summary of pipeline performance, average duration, and success rate would be shown here.</p>
                    </TabsContent>
                    <TabsContent value="runs">
                        <p className="text-muted-foreground">A detailed, filterable history of all runs for this pipeline would be displayed here.</p>
                    </TabsContent>
                     <TabsContent value="settings" className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>General</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="pipeline-name">Pipeline Name</Label>
                              <Input id="pipeline-name" defaultValue={selectedPipeline.name} />
                            </div>
                             <div className="space-y-2">
                              <Label htmlFor="pipeline-desc">Description</Label>
                              <Input id="pipeline-desc" defaultValue={selectedPipeline.description} />
                            </div>
                          </CardContent>
                        </Card>

                         <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5"/> Triggers</CardTitle>
                            <CardDescription>Configure how this pipeline is automatically triggered.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <p className="font-medium">Run on new Pull Request to <code className="bg-muted px-1.5 py-1 rounded-sm text-sm">main</code></p>
                                <ManagerActionButton permission="editProjectSettings" tooltip="Configure webhook trigger">
                                    <Switch defaultChecked/>
                                </ManagerActionButton>
                            </div>
                            <ManagerActionButton permission="editProjectSettings" tooltip="Connect a Git repository.">
                                <Link className="mr-2 h-4 w-4"/> Connect to GitHub / GitLab
                            </ManagerActionButton>
                          </CardContent>
                        </Card>
                        
                         <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/> Scheduling</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                             <div className="space-y-2">
                              <Label htmlFor="cron-schedule">CRON Schedule</Label>
                              <Input id="cron-schedule" placeholder="0 2 * * *" defaultValue="0 2 * * 1-5" />
                              <p className="text-xs text-muted-foreground">Runs at 2:00 AM, Monday through Friday.</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/> Notifications</CardTitle>
                          </CardHeader>
                           <CardContent className="space-y-4">
                             <div className="space-y-2">
                              <Label htmlFor="slack-channel">Slack Channel</Label>
                              <Input id="slack-channel" placeholder="#qa-channel" />
                            </div>
                             <div className="flex items-center space-x-2">
                                <Switch id="notify-failure" defaultChecked/>
                                <Label htmlFor="notify-failure">Notify on failure only</Label>
                            </div>
                          </CardContent>
                        </Card>

                         <Card className="border-destructive/50">
                          <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2"><Trash2 className="h-5 w-5"/> Danger Zone</CardTitle>
                          </CardHeader>
                           <CardContent>
                               <ManagerActionButton permission="adminOverride" tooltip="Permanently delete this pipeline.">
                                  Delete Pipeline
                               </ManagerActionButton>
                               <p className="text-xs text-muted-foreground mt-2">This action cannot be undone.</p>
                          </CardContent>
                        </Card>
                    </TabsContent>
                  </CardContent>
                </Tabs>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                    <PlayCircle className="h-16 w-16 mb-4"/>
                    <h3 className="text-lg font-semibold">Select a Pipeline</h3>
                    <p>Choose a pipeline from the list to view its details, history, and actions.</p>
                </div>
            )}
        </Card>
      </div>

       {/* Sticky Footer */}
      <div className="sticky bottom-0 mt-auto p-4 bg-background/80 backdrop-blur-sm border-t -mx-6">
         <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <BarChart3 className="h-5 w-5 text-muted-foreground"/>
                <p className="font-medium">Global Runner Status:</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>4/8 Runners Active</span>
                </div>
            </div>
             <Button variant="outline">View All Executions</Button>
         </div>
      </div>
    </div>
  );
}

