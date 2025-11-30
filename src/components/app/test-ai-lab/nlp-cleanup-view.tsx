"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Check, Sparkles, Wand2, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type CleanedStep = {
  original: string;
  cleaned: string;
  confidence: number;
  suggestion: string;
  type: "syntax" | "clarity";
};

interface NlpCleanupViewProps {
  testCase: {
    id: string;
    summary: string;
    originalSteps: string[];
  };
  initialCleanedSteps: CleanedStep[];
  onComplete: (finalSteps: CleanedStep[]) => void;
}

export function NlpCleanupView({ testCase, initialCleanedSteps, onComplete }: NlpCleanupViewProps) {
  const [cleanedSteps, setCleanedSteps] = useState(initialCleanedSteps);
  const [activeStep, setActiveStep] = useState(0);

  const handleCleanedStepChange = (index: number, value: string) => {
    const newSteps = [...cleanedSteps];
    newSteps[index].cleaned = value;
    setCleanedSteps(newSteps);
  };
  
  const handleAcceptSuggestion = (index: number) => {
     // This is just a placeholder action. In a real app, you might apply some transformation.
     // For now, we'll just move to the next step.
     if (activeStep < cleanedSteps.length -1) {
        setActiveStep(s => s + 1);
     }
  }
  
  const handleRejectSuggestion = (index: number) => {
    // Placeholder for rejecting a suggestion
    if (activeStep < cleanedSteps.length -1) {
        setActiveStep(s => s + 1);
     }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 90) return "bg-green-100 text-green-800 border-green-200";
    if (confidence > 80) return "bg-sky-100 text-sky-800 border-sky-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Wand2 className="h-8 w-8 text-primary"/>
                TestAI Lab: NLP Cleanup
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Review and refine the AI-generated test steps for <span className="font-semibold text-foreground">{testCase.id}</span>.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Pane: Original Steps */}
            <Card>
                <CardHeader>
                    <CardTitle>Original TMT Steps</CardTitle>
                    <CardDescription>These are the raw, unedited steps from your test case.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {testCase.originalSteps.map((step, index) => (
                            <li key={index} className={`p-4 rounded-md transition-colors duration-300 ${activeStep === index ? 'bg-primary/10 border-l-4 border-primary' : 'bg-muted/50'}`}>
                                <span className="font-mono text-xs text-muted-foreground mr-2">{index + 1}.</span>
                                {step}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Right Pane: Cleaned Steps & Suggestions */}
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Cleaned Steps</CardTitle>
                        <CardDescription>Edit the steps below. The AI has provided suggestions for clarity and syntax.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {cleanedSteps.map((step, index) => (
                            <motion.div 
                                key={index}
                                layout
                                animate={{ opacity: activeStep === index ? 1 : 0.5, y: activeStep === index ? 0: 5 }}
                                className="space-y-2"
                            >
                                <Textarea
                                    value={step.cleaned}
                                    onChange={(e) => handleCleanedStepChange(index, e.target.value)}
                                    className="text-base focus:shadow-md transition-shadow"
                                    rows={2}
                                    onClick={() => setActiveStep(index)}
                                />
                                {activeStep === index && (
                                     <motion.div 
                                        initial={{opacity: 0, y: -10}}
                                        animate={{opacity: 1, y: 0}}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={getConfidenceColor(step.confidence)}>
                                                <Sparkles className="h-3 w-3 mr-1.5" />
                                                Confidence: {step.confidence}%
                                            </Badge>
                                             <Badge variant="secondary" className="capitalize">
                                                {step.type}
                                            </Badge>
                                        </div>
                                         <div className="flex items-center gap-1">
                                             <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => handleRejectSuggestion(index)}><ThumbsDown className="h-4 w-4 mr-1"/> Reject</Button>
                                             <Button size="sm" onClick={() => handleAcceptSuggestion(index)}><ThumbsUp className="h-4 w-4 mr-1"/> Accept</Button>
                                         </div>
                                    </motion.div>
                                )}
                            </motion.div>
                         ))}
                    </CardContent>
                </Card>
                
                 <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                    <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <h3 className="font-bold">Ready to proceed?</h3>
                         <p className="text-sm opacity-80">Once you're happy with the steps, we'll convert them to Gherkin format.</p>
                       </div>
                        <Button variant="secondary" size="lg" onClick={() => onComplete(cleanedSteps)}>
                            Prepare Gherkin <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
