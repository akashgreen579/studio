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
import { Search, PlusCircle, Play, Settings, BarChart3, CheckCircle2, XCircle, Loader, Clock } from "lucide-react";
import { projects, pipelines, pipelineTemplates, type User, getEffectivePermissions } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>("pipe-1");
  const permissions = getEffectivePermissions(user.id);
  
  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId) || pipelineTemplates.find(p => p.id === selectedPipelineId);

  const ManagerActionButton = ({ permission, tooltip, children, className, onClick, asChild, disabled }: { permission: keyof (typeof permissions), tooltip: string, children: React.ReactNode, className?: string, onClick?: () => void, asChild?: boolean, disabled?: boolean }) => {
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
                             <ManagerActionButton permission="runPipelines" tooltip="Configure this pipeline's settings.">
                                <Settings className="mr-2 h-4 w-4"/>Edit
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
                        <p>Summary of pipeline performance and configuration would be shown here.</p>
                    </TabsContent>
                    <TabsContent value="runs">
                        <p>A detailed history of all runs for this pipeline would be displayed here.</p>
                    </TabsContent>
                     <TabsContent value="settings">
                        <p>Settings for this pipeline, such as triggers, notifications, and parameters would be editable here.</p>
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