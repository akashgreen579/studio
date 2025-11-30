
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Bot, Target, Play, Pause, Square, Rewind, FastForward, Keyboard, MousePointer, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { recordedActions, type RecordedAction } from "@/lib/data";

interface ActionSimulationViewProps {
  testCase: {
    id: string;
    summary: string;
  };
  steps: string[];
  onComplete: () => void;
}

type RecordingState = "idle" | "recording" | "paused" | "playing";

const ActionIcon = ({ type }: { type: RecordedAction['type'] }) => {
    switch(type) {
        case 'navigate': return <Target className="h-4 w-4"/>
        case 'click': return <MousePointer className="h-4 w-4"/>
        case 'type': return <Keyboard className="h-4 w-4"/>
        default: return null;
    }
}

export function ActionSimulationView({ testCase, steps, onComplete }: ActionSimulationViewProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (recordingState === 'recording') {
        setActions([]);
        setElapsedTime(0);
        
        let actionIndex = 0;
        timer = setInterval(() => {
           setElapsedTime(prev => prev + 100);
           if (actionIndex < recordedActions.length && elapsedTime >= recordedActions[actionIndex].timestamp) {
               setActions(prev => [...prev, recordedActions[actionIndex]]);
               actionIndex++;
           }
           if (actionIndex >= recordedActions.length) {
                setRecordingState("idle");
                clearInterval(timer);
           }
        }, 100);
    }
    return () => clearInterval(timer);
  }, [recordingState, elapsedTime]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          TestAI Lab: Action Simulation
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Record user actions in a simulated browser to generate automation logic.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Left Pane: Simulation Browser */}
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Simulation Pane</CardTitle>
                <CardDescription>Interact with the application below to record your test steps.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 relative">
                <div className="absolute inset-0 bg-muted/40 flex items-center justify-center">
                    <div className="text-center p-8 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">Embedded Browser</h3>
                        <p className="text-muted-foreground mt-2">A live application view would appear here.<br/> Click "Record" to begin the simulation.</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Right Pane: Timeline & Controls */}
        <div className="space-y-6 sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle>Recorder Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-2 rounded-lg bg-muted flex items-center justify-between">
                <Badge variant={recordingState === 'recording' ? 'destructive' : 'secondary' } className="capitalize text-base">
                    {recordingState}
                </Badge>
                <p className="font-mono text-xl">{(elapsedTime / 1000).toFixed(1)}s</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="secondary" size="lg" onClick={() => setRecordingState("recording")} disabled={recordingState === 'recording'}>
                    <Play className="h-5 w-5 mr-2"/> Record
                </Button>
                <Button variant="outline" size="lg" disabled={recordingState !== 'recording'}>
                    <Pause className="h-5 w-5"/>
                </Button>
                <Button variant="destructive" size="lg" disabled={recordingState !== 'recording' && recordingState !== 'paused'}>
                    <Square className="h-5 w-5"/>
                </Button>
              </div>
               <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                 <Button variant="ghost" size="sm" disabled={actions.length === 0}><Rewind className="h-4 w-4"/></Button>
                 <Button variant="ghost" size="sm" disabled={actions.length === 0}><Play className="h-4 w-4"/></Button>
                 <Button variant="ghost" size="sm" disabled={actions.length === 0}><FastForward className="h-4 w-4"/></Button>
               </div>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
                <CardTitle>Timeline</CardTitle>
             </CardHeader>
             <CardContent>
                <ScrollArea className="h-64">
                    {actions.length > 0 ? (
                        <div className="space-y-3">
                            {actions.map(action => (
                                <div key={action.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                                    <div className="p-2 bg-muted rounded-full mt-1">
                                        <ActionIcon type={action.type}/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium capitalize">{action.type}</p>
                                        <p className="text-xs text-muted-foreground truncate">{action.value ? `Value: "${action.value}"` : `Selector: ${action.element}`}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-10">
                            <p>No actions recorded yet.</p>
                        </div>
                    )}
                </ScrollArea>
             </CardContent>
          </Card>
           <Button size="lg" className="w-full" onClick={onComplete} disabled={actions.length === 0}>
                Generate Code <ArrowRight className="ml-2 h-5 w-5"/>
            </Button>
        </div>
      </div>
    </div>
  );
}
