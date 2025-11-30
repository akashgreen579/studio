
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Loader, ChevronsRight, AlertTriangle, Wand, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DryRunModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

type StepStatus = "pending" | "running" | "success" | "failure";
interface RunStep {
    name: string;
    status: StepStatus;
    log: string;
    duration?: number;
}

const initialSteps: RunStep[] = [
    { name: "Given the user is on the login page", status: "pending", log: "" },
    { name: "When the user enters their username and password", status: "pending", log: "" },
    { name: "And the user clicks the 'Login' button", status: "pending", log: "" },
    { name: "Then the user is redirected to the dashboard page", status: "pending", log: "" },
    { name: "And a 'Welcome' message is displayed", status: "pending", log: "" },
];

export function DryRunModal({ isOpen, setIsOpen }: DryRunModalProps) {
    const [steps, setSteps] = useState<RunStep[]>(initialSteps);
    const [isRunning, setIsRunning] = useState(false);
    const [runFailed, setRunFailed] = useState(false);
    const [showHeal, setShowHeal] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setTimeout(() => {
                 setSteps(initialSteps);
                 setIsRunning(false);
                 setRunFailed(false);
                 setShowHeal(false);
            }, 300);
            return;
        }

        setIsRunning(true);
        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                const isFailure = currentStep === 2; // Let's pretend step 3 fails
                
                setSteps(prev => prev.map((step, index) => {
                    if (index < currentStep) return { ...step, status: "success" as StepStatus };
                    if (index === currentStep) return { 
                        ...step, 
                        status: isFailure ? "failure" : "running" as StepStatus,
                        log: isFailure ? "ERROR: Element with selector [button.login-btn] not found after 5000ms." : `Executing step... on element [${step.name.split("'")[1] || 'page'}]`,
                        duration: 1200
                    };
                    return step;
                }));

                if (isFailure) {
                    setIsRunning(false);
                    setRunFailed(true);
                    clearInterval(interval);
                    setTimeout(() => setShowHeal(true), 1000);
                } else {
                    currentStep++;
                }

            } else {
                 setSteps(prev => prev.map(step => ({...step, status: "success"})));
                 setIsRunning(false);
                 clearInterval(interval);
            }
        }, 1500);

        return () => clearInterval(interval);

    }, [isOpen]);

    const handleRetry = () => {
        setRunFailed(false);
        setShowHeal(false);
        setSteps(initialSteps);
        setIsRunning(true);
        // This would re-trigger the useEffect to run the simulation again
        // For this mock, we just restart the state and let the effect run on next open.
        setIsOpen(false);
        setTimeout(() => setIsOpen(true), 100);
    }

    const StatusIcon = ({ status }: { status: StepStatus }) => {
        switch (status) {
            case "running": return <Loader className="h-5 w-5 animate-spin text-primary" />;
            case "success": return <Check className="h-5 w-5 text-green-500" />;
            case "failure": return <X className="h-5 w-5 text-red-500" />;
            default: return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40" />;
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Dry Run Simulation</DialogTitle>
                    <DialogDescription>
                        Executing the generated script in a sandboxed environment to validate its behavior.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 p-4 border rounded-lg bg-muted/50 max-h-[60vh] overflow-y-auto">
                    <div className="font-mono text-xs space-y-3">
                        {steps.map((step, index) => (
                           <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4 p-3 rounded-md bg-background"
                            >
                                <StatusIcon status={step.status} />
                                <div className="flex-1">
                                    <p className="font-medium">{step.name}</p>
                                    {step.log && (
                                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                            <ChevronsRight className="h-3 w-3"/>
                                            <p className={step.status === 'failure' ? 'text-red-500' : ''}>{step.log}</p>
                                        </div>
                                    )}
                                </div>
                                {step.duration && <Badge variant="outline">{step.duration}ms</Badge>}
                           </motion.div>
                        ))}
                    </div>

                    <AnimatePresence>
                        {showHeal && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTriangle className="h-4 w-4"/>
                                    <AlertTitle>Auto-Heal Suggestion</AlertTitle>
                                    <AlertDescription>
                                        The AI detected that the selector for 'Login' button might be unstable.
                                        <div className="my-2 p-2 rounded bg-destructive/10 font-mono text-xs">
                                            - `button.login-btn`<br/>
                                            + `button[data-testid='login-submit']`
                                        </div>
                                        Applying this change may fix the issue.
                                        <div className="mt-3 flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setShowHeal(false);
                                                handleRetry();
                                            }}>
                                                <Wand className="h-4 w-4 mr-2" /> Apply Heal & Retry
                                            </Button>
                                             <Button variant="ghost" size="sm" onClick={() => setShowHeal(false)}>Ignore</Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isRunning}>
                        {isRunning ? "Close After Run" : "Close"}
                    </Button>
                    <Button disabled={isRunning || !runFailed} onClick={handleRetry}>
                       <RefreshCw className="h-4 w-4 mr-2"/> Retry Run
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    