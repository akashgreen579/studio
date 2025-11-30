
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader, Check, AlertTriangle, FileCode, GitBranch, Share2, Bot, GitMerge, FolderPlus, FolderCheck, FolderSearch, BrainCircuit, Wand, TestTube, FileText, BotMessageSquare } from "lucide-react";
import { type TestCase } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface AutomationWorkflowModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  testCase: TestCase;
}

type StepStatus = "pending" | "running" | "success" | "warning" | "error";

interface Step {
  name: string;
  status: StepStatus;
  description: string;
  component?: React.ReactNode;
}

const StatusIcon = ({ status }: { status: StepStatus }) => {
  switch (status) {
    case "running":
      return <Loader className="h-5 w-5 animate-spin text-primary" />;
    case "success":
      return <Check className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50" />;
  }
};

const FolderFoundCard = ({ onContinue }: { onContinue: () => void }) => (
    <Card className="bg-green-50 border-green-200">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
            <FolderCheck className="h-6 w-6 text-green-600"/>
            <div>
                <CardTitle className="text-base text-green-900">Folder Found & Reused</CardTitle>
                <p className="text-sm text-green-800">An exact match for the folder structure exists. Automatically proceeding...</p>
            </div>
        </CardHeader>
    </Card>
);

const SimilarFolderCard = ({ onReuse, onCreate }: { onReuse: () => void, onCreate: () => void }) => (
    <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="p-4">
             <div className="flex flex-row items-center gap-3 space-y-0">
                <FolderSearch className="h-6 w-6 text-amber-600"/>
                <div>
                    <CardTitle className="text-base text-amber-900">Similar Folder Found</CardTitle>
                    <p className="text-sm text-amber-800">We found a similar folder structure. Do you want to reuse it?</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="rounded-md bg-background/50 p-3 text-sm font-mono text-muted-foreground">
                /src/test/java/com/company/auth/
            </div>
            <div className="mt-4 flex gap-2">
                <Button onClick={onReuse}>Reuse Existing</Button>
                <Button variant="outline" onClick={onCreate}>Create New Structure</Button>
            </div>
        </CardContent>
    </Card>
);

const CreateFolderCard = ({ onCreate }: { onCreate: () => void }) => (
    <Card>
        <CardHeader className="p-4">
            <div className="flex flex-row items-center gap-3 space-y-0">
                <FolderPlus className="h-6 w-6 text-primary"/>
                <div>
                    <CardTitle className="text-base">Create New Folder Structure</CardTitle>
                    <p className="text-sm text-muted-foreground">The required folder structure does not exist. It will be created for you.</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <p className="text-sm mb-2">The following folders will be created:</p>
            <div className="rounded-md bg-muted p-3 text-sm font-mono text-muted-foreground">
                /src/test/java/com/company/auth/positive/
            </div>
             <div className="mt-4 flex gap-2">
                <Button onClick={onCreate}>Create & Continue</Button>
            </div>
        </CardContent>
    </Card>
)

const MergeAnimation = ({ onComplete }: { onComplete: () => void }) => {
    const mergeSteps = [
        { name: "Commit to branch 'feat/TC-101-automation'", icon: GitBranch },
        { name: "Create Merge Request", icon: Share2 },
        { name: "AI Code Review...", icon: Bot },
        { name: "Auto-Merge to 'main'", icon: GitMerge }
    ];
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < mergeSteps.length) {
            const timer = setTimeout(() => setCurrentStep(s => s + 1), 1000);
            return () => clearTimeout(timer);
        } else {
            const finalTimer = setTimeout(onComplete, 1500);
            return () => clearTimeout(finalTimer);
        }
    }, [currentStep, onComplete, mergeSteps.length]);
    
    return (
        <div className="p-4">
            <AnimatePresence>
                {currentStep === mergeSteps.length && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center p-8 bg-green-50 rounded-lg"
                    >
                        <Check className="h-16 w-16 text-green-500 mb-4"/>
                        <h3 className="text-lg font-semibold text-green-900">Automation Complete</h3>
                        <p className="text-sm text-green-800">The baseline automation script has been merged to main.</p>
                    </motion.div>
                )}
            </AnimatePresence>
             {currentStep < mergeSteps.length && <div className="space-y-4">
                {mergeSteps.map((step, index) => (
                    <motion.div
                        key={step.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: currentStep >= index ? 1 : 0.4, y: currentStep >= index ? 0 : 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4"
                    >
                        <div className={`p-2 rounded-full ${currentStep > index ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                            {currentStep > index ? <Check className="h-5 w-5"/> : <step.icon className="h-5 w-5"/>}
                        </div>
                        <p className={`text-sm font-medium ${currentStep < index && 'text-muted-foreground'}`}>{step.name}</p>
                         {currentStep === index && <Loader className="h-4 w-4 animate-spin text-primary ml-auto"/>}
                    </motion.div>
                ))}
            </div>}
        </div>
    )
}

const WorkspacePrepAnimation = ({ onComplete }: { onComplete: () => void }) => {
    const prepSteps = [
        { name: "NLP Cleanup", icon: BotMessageSquare },
        { name: "Gherkin Preparation", icon: FileText },
        { name: "Keyword Analysis", icon: Wand },
        { name: "Action Simulation Setup", icon: TestTube },
        { name: "Code Generation", icon: BrainCircuit }
    ];
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < prepSteps.length) {
            const timer = setTimeout(() => setCurrentStep(s => s + 1), 700);
            return () => clearTimeout(timer);
        } else {
            const finalTimer = setTimeout(onComplete, 100);
            return () => clearTimeout(finalTimer);
        }
    }, [currentStep, onComplete, prepSteps.length]);
    
    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold text-center mb-6">Preparing Automation Workspace...</h3>
            <div className="space-y-4">
                {prepSteps.map((step, index) => (
                    <motion.div
                        key={step.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: currentStep >= index ? 1 : 0.4, y: currentStep >= index ? 0 : 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4"
                    >
                        <div className={`p-2 rounded-full ${currentStep > index ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                            {currentStep > index ? <Check className="h-5 w-5"/> : <step.icon className="h-5 w-5"/>}
                        </div>
                        <p className={`text-sm font-medium ${currentStep < index && 'text-muted-foreground'}`}>{step.name}</p>
                         {currentStep === index && <Loader className="h-4 w-4 animate-spin text-primary ml-auto"/>}
                    </motion.div>
                ))}
            </div>
             {currentStep === prepSteps.length && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-8 text-primary font-medium"
                >
                    Transitioning to TestAI Lab...
                </motion.div>
             )}
        </div>
    )
}

type WorkflowStage = "validation" | "workspacePrep";

export function AutomationWorkflowModal({ isOpen, setIsOpen, testCase }: AutomationWorkflowModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [workflowStage, setWorkflowStage] = useState<WorkflowStage>("validation");
    const [steps, setSteps] = useState<Step[]>([
        { name: "Initialize", status: "pending", description: "Connecting to Git repository & pulling latest 'main'..." },
        { name: "Validate Folder Structure", status: "pending", description: "Checking for existing automation folders..." },
        { name: "Generate & Merge Script", status: "pending", description: "Creating baseline script and merging to main." },
    ]);

    const handleClose = () => setIsOpen(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setTimeout(() => {
                setCurrentStepIndex(0);
                setSteps(prev => prev.map(s => ({ ...s, status: 'pending', component: undefined })));
                setWorkflowStage("validation");
            }, 300);
            return;
        }

        const runWorkflow = async () => {
            // Step 1: Initialize
            setCurrentStepIndex(0);
            setSteps(prev => {
                const newSteps = [...prev];
                newSteps[0].status = 'running';
                return newSteps;
            });
            await new Promise(res => setTimeout(res, 1500));
            setSteps(prev => {
                const newSteps = [...prev];
                newSteps[0].status = 'success';
                return newSteps;
            });

            // Step 2: Folder Check
            setCurrentStepIndex(1);
            setSteps(prev => {
                const newSteps = [...prev];
                newSteps[1].status = 'running';
                return newSteps;
            });
            await new Promise(res => setTimeout(res, 2000));
            
            // This is where you would have logic to check folder status
            const folderStatus = 'similar'; // "exact" | "similar" | "missing"
            setSteps(prev => {
                const newSteps = [...prev];
                newSteps[1].status = 'warning'; // Paused for user input
                if (folderStatus === 'exact') {
                    newSteps[1].component = <FolderFoundCard onContinue={proceedToStep3} />;
                    setTimeout(() => proceedToStep3(), 2000);
                } else if (folderStatus === 'similar') {
                    newSteps[1].component = <SimilarFolderCard onReuse={proceedToStep3} onCreate={proceedToStep3} />;
                } else { // 'missing'
                    newSteps[1].component = <CreateFolderCard onCreate={proceedToStep3} />;
                }
                return newSteps;
            });
        };
        
        runWorkflow();

    }, [isOpen]);

    const handleFinalCompletion = () => {
        router.push('/dashboard?view=test-ai-lab');
        setIsOpen(false);
        toast({
            title: "Workspace Ready!",
            description: `Now entering the TestAI Lab for ${testCase.id}.`,
        });
    };

    const proceedToStep3 = () => {
        // Step 3: Generate & Merge
        setSteps(prev => {
            const newSteps = [...prev];
            newSteps[1].status = 'success';
            newSteps[1].component = undefined; // Clear component
            newSteps[2].status = 'running';
            newSteps[2].component = <MergeAnimation onComplete={() => {
                setSteps(prev => {
                    const finalSteps = [...prev];
                    finalSteps[2].status = 'success';
                    finalSteps[2].description = "Baseline script merged. Preparing workspace...";
                    return finalSteps;
                });
                setWorkflowStage("workspacePrep");
            }}/>;
            return newSteps;
        });
        setCurrentStepIndex(2);
    }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode /> Automating Test Case: {testCase.id.toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            {testCase.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
            <AnimatePresence mode="wait">
                {workflowStage === 'validation' ? (
                     <motion.div key="validation-steps" className="space-y-6">
                        {steps.map((step, index) => (
                            <div key={step.name} className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <StatusIcon status={step.status} />
                                    <div className="flex-1">
                                        <h4 className={`font-medium ${currentStepIndex < index && 'text-muted-foreground'}`}>{step.name}</h4>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                                {currentStepIndex === index && step.component && (
                                    <motion.div 
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        className="mt-4 pl-9"
                                    >
                                        {step.component}
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="prep-workspace"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <WorkspacePrepAnimation onComplete={handleFinalCompletion} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <DialogFooter className="justify-between">
          <div>
            <Button variant="ghost">Run in Background</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
                Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
