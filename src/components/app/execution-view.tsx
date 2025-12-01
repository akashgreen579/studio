
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  X,
  Play,
  Pause,
  RefreshCw,
  Download,
  Terminal,
  Monitor,
  CheckCircle2,
  XCircle,
  Loader,
  Clock,
  Wand,
  AlertTriangle,
} from "lucide-react";
import {
  executionJobs,
  executionSteps,
  type Pipeline,
  type ExecutionJob,
  type ExecutionStep,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface ExecutionViewProps {
  pipeline: Pipeline;
  onBack: () => void;
}

const getStatusIcon = (
  status: ExecutionJob["status"] | ExecutionStep["status"]
) => {
  const commonClass = "h-4 w-4";
  switch (status) {
    case "passed":
      return <CheckCircle2 className={cn(commonClass, "text-green-500")} />;
    case "failed":
      return <XCircle className={cn(commonClass, "text-red-500")} />;
    case "running":
      return <Loader className={cn(commonClass, "animate-spin text-blue-500")} />;
    case "pending":
      return <Clock className={cn(commonClass, "text-muted-foreground")} />;
    default:
      return null;
  }
};

const browsers: ExecutionJob["browser"][] = ["Chrome", "Firefox", "Safari"];

export function ExecutionView({ pipeline, onBack }: ExecutionViewProps) {
  const [jobs, setJobs] = useState<ExecutionJob[]>(executionJobs);
  const [steps, setSteps] = useState<ExecutionStep[]>(executionSteps);
  const [activeJobId, setActiveJobId] = useState<string | null>("job-4");
  
  const progress = Math.round(
    (jobs.filter((j) => j.status === "passed" || j.status === "failed").length /
      jobs.length) *
      100
  );

  const activeJob = jobs.find((j) => j.id === activeJobId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{pipeline.name}</h1>
            <p className="text-muted-foreground">
              Run ID: {pipeline.lastRun.id}
            </p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Loader className="h-4 w-4 animate-spin text-blue-500" />
            Running
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
          <Button variant="destructive">
            <X className="mr-2 h-4 w-4" /> Cancel Run
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">{progress}%</span>
            <Progress value={progress} className="flex-1" />
            <span className="text-sm text-muted-foreground">
              Est. time remaining: {10 - Math.floor((progress / 100) * 10)} min
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Panel: Matrix & Logs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" /> Job Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                <div className="font-semibold text-sm">Test Case</div>
                {browsers.map((b) => (
                  <div key={b} className="font-semibold text-sm text-center w-20">
                    {b}
                  </div>
                ))}

                {Array.from(new Set(jobs.map((j) => j.testCaseId))).map(
                  (tcId) => (
                    <div
                      key={tcId}
                      className="contents group"
                    >
                      <div className="text-sm font-medium truncate p-2 rounded-l-md group-hover:bg-muted transition-colors">
                        {tcId.toUpperCase()}
                      </div>
                      {browsers.map((browser) => {
                        const job = jobs.find(
                          (j) =>
                            j.testCaseId === tcId && j.browser === browser
                        );
                        return (
                          <div
                            key={browser}
                            onClick={() => job && setActiveJobId(job.id)}
                            className={cn("h-10 w-20 flex items-center justify-center rounded-md cursor-pointer transition-all",
                                job ? 'hover:scale-105 hover:shadow-md' : 'bg-muted/30',
                                activeJobId === job?.id && 'ring-2 ring-primary ring-offset-2',
                                job?.status === 'passed' && 'bg-green-100/80 text-green-700',
                                job?.status === 'failed' && 'bg-red-100/80 text-red-700',
                                job?.status === 'running' && 'bg-blue-100/80 text-blue-700 animate-pulse',
                                job?.status === 'pending' && 'bg-muted/60'
                            )}
                          >
                            {job && getStatusIcon(job.status)}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
          <Collapsible>
            <Card>
                <CollapsibleTrigger asChild>
                    <div className="p-4 border-b cursor-pointer flex justify-between items-center">
                         <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5" /> Live Logs
                        </CardTitle>
                        <Button variant="ghost" size="sm">Collapse</Button>
                    </div>
                </CollapsibleTrigger>
              <CollapsibleContent>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                    <div className="p-4 font-mono text-xs text-muted-foreground space-y-1">
                        <p>[INFO] Starting pipeline run pipe-2...</p>
                        <p>[INFO] Provisioning 3 runners on Chrome, Firefox, Safari...</p>
                        <p>[RUNNER-1] Starting tc-101 on Chrome...</p>
                        <p>[RUNNER-2] Starting tc-203 on Chrome...</p>
                        <p>[RUNNER-1] PASSED tc-101 in 15.2s</p>
                        <p>[RUNNER-3] Starting tc-101 on Firefox...</p>
                        <p>[ERROR] [RUNNER-2] FAILED tc-203 on Chrome. See details.</p>
                        <p className="text-red-500">[ERROR] [RUNNER-2]   Timeout: Element #login-btn not found.</p>
                    </div>
                </ScrollArea>
              </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right Panel: Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Details for {activeJob?.testCaseId.toUpperCase()} on{" "}
                {activeJob?.browser}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  {getStatusIcon(step.status)}
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-sm">{step.name}</p>
                    {step.log && (
                      <p
                        className={cn(
                          "text-xs font-mono",
                          step.status === "failed"
                            ? "text-red-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.log}
                      </p>
                    )}
                    {step.screenshotUrl && (
                      <Image
                        src={step.screenshotUrl}
                        alt="Step screenshot"
                        width={200}
                        height={125}
                        className="rounded-md border-2 border-destructive"
                      />
                    )}
                  </div>
                  {step.duration && (
                    <Badge variant="outline">{step.duration}ms</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          
          {activeJob?.status === 'failed' && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 !text-amber-600"/>
                  <AlertTitle className="text-amber-900 flex items-center gap-2"><Wand className="h-4 w-4"/> AI Auto-Heal Suggestion</AlertTitle>
                  <AlertDescription className="text-amber-800">
                      The AI detected a potential selector issue. The selector for the 'Login' button might be unstable.
                      <div className="my-2 p-2 rounded bg-amber-100 font-mono text-xs">
                        - `button.login-btn`<br />
                        + `button[data-testid='login-submit']`
                      </div>
                      Applying this change may fix the issue.
                      <div className="mt-3">
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Apply & Re-run Job</Button>
                      </div>
                  </AlertDescription>
              </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Artifacts</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Download Allure Report</Button>
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Download Logs</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
