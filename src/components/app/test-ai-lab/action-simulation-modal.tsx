
"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Target,
  Play,
  Pause,
  Square,
  Keyboard,
  MousePointer,
  Trash2,
  X,
  Loader,
} from "lucide-react";
import { recordedActions, type RecordedAction } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";


interface ActionSimulationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  gherkinStep: string;
  onGenerate: (actions: RecordedAction[]) => void;
}

type RecordingState = "idle" | "recording" | "paused";

const ActionIcon = ({ type }: { type: RecordedAction["type"] }) => {
  switch (type) {
    case "navigate":
      return <Target className="h-4 w-4" />;
    case "click":
      return <MousePointer className="h-4 w-4" />;
    case "type":
      return <Keyboard className="h-4 w-4" />;
    default:
      return null;
  }
};

const ShimmerPlaceholder = () => (
    <div className="absolute inset-0 overflow-hidden bg-muted/40">
        <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent"
        />
    </div>
)

export function ActionSimulationModal({
  isOpen,
  setIsOpen,
  gherkinStep,
  onGenerate,
}: ActionSimulationModalProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const actionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const actionIndexRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      // Clean up timers on close
      if (timerRef.current) clearInterval(timerRef.current);
      if (actionTimerRef.current) clearInterval(actionTimerRef.current);
      setRecordingState("idle");
      // Don't reset actions or time if we want to preserve state on reopen
    }
  }, [isOpen]);

  const startRecording = () => {
    setRecordingState("recording");
    setActions([]);
    setElapsedTime(0);
    actionIndexRef.current = 0;

    timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 100);
    }, 100);
    
    actionTimerRef.current = setInterval(() => {
        const nextAction = recordedActions[actionIndexRef.current];
        if (nextAction) {
            setActions(prev => [...prev, nextAction]);
            actionIndexRef.current++;
        } else {
            stopRecording();
        }
    }, 1500);
  }
  
  const stopRecording = () => {
      setRecordingState("idle");
      if (timerRef.current) clearInterval(timerRef.current);
      if (actionTimerRef.current) clearInterval(actionTimerRef.current);
  }

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(action => action.id !== id));
  };
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-none w-full h-[80vh] top-auto bottom-0 translate-y-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom-0 rounded-b-none rounded-t-2xl p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Bot className="h-6 w-6 text-primary" />
            Action Simulation
          </DialogTitle>
          <DialogDescription>
            Record actions for: <span className="font-semibold text-foreground">{gherkinStep}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 px-6 pb-6 overflow-hidden">
          {/* Left Pane: Simulation Browser */}
          <Card className="h-full flex flex-col shadow-sm">
            <CardHeader>
              <CardTitle>Simulation Pane</CardTitle>
              <CardDescription>Interact with the application below to record your test steps.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-4 relative">
                <div className="h-full w-full border-2 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                    {recordingState === 'idle' && (
                        <div className="text-center p-8">
                            <h3 className="text-xl font-semibold">Embedded Browser</h3>
                            <p className="text-muted-foreground mt-2">A live application view will appear here.<br/> Click "Record" to begin the simulation.</p>
                        </div>
                    )}
                    {(recordingState === 'recording' || recordingState === 'paused') && <ShimmerPlaceholder />}
                </div>
            </CardContent>
          </Card>

          {/* Right Pane: Timeline & Controls */}
          <div className="space-y-6 flex flex-col h-full overflow-hidden">
            <Card>
              <CardHeader>
                <CardTitle>Recorder Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-2 rounded-lg bg-muted flex items-center justify-between">
                  <Badge 
                    variant={recordingState === 'recording' ? 'destructive' : 'secondary'} 
                    className={cn("capitalize text-base transition-colors", recordingState === 'recording' && 'animate-pulse')}
                  >
                    {recordingState}
                  </Badge>
                  <p className="font-mono text-xl">{formatTime(elapsedTime)}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="default" size="lg" onClick={startRecording} disabled={recordingState !== 'idle'}>
                    <Play className="h-5 w-5 mr-2" /> Record
                  </Button>
                  <Button variant="secondary" size="lg" disabled={recordingState !== 'recording'}>
                    <Pause className="h-5 w-5" />
                  </Button>
                  <Button variant="destructive" size="lg" onClick={stopRecording} disabled={recordingState === 'idle'}>
                    <Square className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex-grow flex flex-col overflow-hidden">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-2 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-2">
                        {actions.length > 0 ? (
                            <div className="space-y-2">
                                <AnimatePresence>
                                {actions.map((action, index) => (
                                    <motion.div 
                                        key={action.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
                                    >
                                    <div className="p-2 bg-muted rounded-full">
                                        <ActionIcon type={action.type} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium capitalize">{action.type}</p>
                                        <p className="text-xs text-muted-foreground truncate">{action.value ? `Value: "${action.value}"` : `Selector: ${action.element}`}</p>
                                    </div>
                                    <p className="text-xs font-mono text-muted-foreground">{`@${(action.timestamp/1000).toFixed(1)}s`}</p>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteAction(action.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-10 h-full flex flex-col items-center justify-center">
                                <Loader className="h-8 w-8 mb-4"/>
                                <p>No actions recorded yet.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t bg-background/80 backdrop-blur-sm mt-auto">
             <Button size="lg" className="w-full glow-on-enable" onClick={() => onGenerate(actions)} disabled={actions.length === 0}>
                Generate Code &rarr;
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    

  