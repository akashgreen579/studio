
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, Wand, RefreshCw, Server } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { User, Permissions, ExistingKeyword } from "@/lib/data";
import { getEffectivePermissions, existingKeywords } from "@/lib/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeywordMappingCard } from "./keyword-mapping-card";
import { CreateKeywordModal, RecordKeywordModal } from "./keyword-action-modals";
import { ApiRequestModal } from "./api-request-modal";


export interface StepMapping {
    id: string;
    gherkinStep: string;
    suggestion: ExistingKeyword | null;
    similarity: number | null;
    status: 'unresolved' | 'resolved';
    action: 'none' | 'reuse' | 'create' | 'record' | 'api';
}


interface KeywordMappingViewProps {
  user: User;
  testCase: {
    id: string;
    summary: string;
  };
  steps: string[];
  onComplete: () => void;
}

export function KeywordMappingView({ user, testCase, steps, onComplete }: KeywordMappingViewProps) {
    const [autoSuggest, setAutoSuggest] = useState(true);
    const [similarityThreshold, setSimilarityThreshold] = useState(80);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isRecordModalOpen, setRecordModalOpen] = useState(false);
    const [isApiModalOpen, setApiModalOpen] = useState(false);
    const [selectedGherkinStep, setSelectedGherkinStep] = useState("");


    const initialMappings: StepMapping[] = [
        { id: 'step-1', gherkinStep: "Given the user is on the login page", suggestion: existingKeywords[0], similarity: 71, status: 'unresolved', action: 'none' },
        { id: 'step-2', gherkinStep: "When the user enters their username and password", suggestion: null, similarity: null, status: 'unresolved', action: 'none' },
        { id: 'step-3', gherkinStep: "And the user clicks the 'Login' button", suggestion: null, similarity: null, status: 'unresolved', action: 'none' },
        { id: 'step-4', gherkinStep: "Then the user is redirected to the dashboard page", suggestion: null, similarity: null, status: 'unresolved', action: 'none' },
        { id: 'step-5', gherkinStep: "And a 'Welcome' message is displayed", suggestion: existingKeywords[4], similarity: 71, status: 'unresolved', action: 'none' },
    ];
    
    const [mappings, setMappings] = useState<StepMapping[]>(initialMappings);

    const handleUpdateMapping = (id: string, newMapping: Partial<StepMapping>) => {
        setMappings(prev => prev.map(m => m.id === id ? { ...m, ...newMapping } : m));
    }
    
    const handleCreate = (gherkinStep: string) => {
        setSelectedGherkinStep(gherkinStep);
        setCreateModalOpen(true);
    }

    const handleRecord = (gherkinStep: string) => {
        setSelectedGherkinStep(gherkinStep);
        setRecordModalOpen(true);
    }
    
    const handleApi = (gherkinStep: string) => {
        setSelectedGherkinStep(gherkinStep);
        setApiModalOpen(true);
    }

    const permissions = getEffectivePermissions(user.id);
    const canBulkReuse = permissions.syncTMT;
    const resolvedCount = mappings.filter(m => m.status === 'resolved').length;
    const progress = Math.round((resolvedCount / mappings.length) * 100);

  return (
    <>
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">
                    TestAI Lab: Keyword Mapping
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                    Map Gherkin steps to reusable code keywords or create new ones for <span className="font-semibold text-foreground">{testCase.id}</span>.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start pb-24">
                {/* Left Pane: Mapping Cards */}
                <div className="space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Step to Keyword Mapping</CardTitle>
                            <CardDescription>Review the AI's suggestions for mapping your test steps to existing code keywords.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-4 px-4 py-2 text-sm font-semibold text-muted-foreground">
                                <span>Gherkin Step</span>
                                <span>Suggested Keyword</span>
                                <span className="justify-self-end">Action</span>
                            </div>
                           {mappings.map(mapping => (
                               <KeywordMappingCard 
                                    key={mapping.id} 
                                    mapping={mapping} 
                                    onUpdate={(newMapping) => handleUpdateMapping(mapping.id, newMapping)}
                                    onCreate={() => handleCreate(mapping.gherkinStep)}
                                    onRecord={() => handleRecord(mapping.gherkinStep)}
                                    onApi={() => handleApi(mapping.gherkinStep)}
                               />
                           ))}
                        </CardContent>
                     </Card>
                </div>
                
                {/* Right Sidebar */}
                <div className="space-y-6 sticky top-20">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-amber-500"/> AI Assistance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <Switch id="auto-suggest-toggle" checked={autoSuggest} onCheckedChange={setAutoSuggest}/>
                                <Label htmlFor="auto-suggest-toggle">Auto-Suggest Reuse</Label>
                            </div>
                            
                            <div className="space-y-3">
                                <Label>Fuzzy Match Threshold: {similarityThreshold}%</Label>
                                <Slider
                                    defaultValue={[similarityThreshold]}
                                    max={100}
                                    step={5}
                                    onValueChange={(value) => setSimilarityThreshold(value[0])}
                                />
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full">
                                            <Button className="w-full" disabled={!canBulkReuse}>
                                               <Wand className="h-4 w-4 mr-2"/> Reuse all suggestions ≥ {similarityThreshold}%
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {!canBulkReuse && (
                                        <TooltipContent>
                                            <p>Requires "Sync TMT" permission.</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>

                             <Button className="w-full" variant="outline">
                               <RefreshCw className="h-4 w-4 mr-2"/> Re-analyze All Steps
                            </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Steps Mapped</span>
                                <span>{resolvedCount} / {mappings.length}</span>
                            </div>
                            <Progress value={progress} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        
        {/* Sticky Footer */}
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm border-t"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between pl-64">
                <div className="flex items-center gap-4">
                    <Progress value={progress} className="w-64 h-2"/>
                    <p className="text-sm text-muted-foreground font-medium">{Math.round(progress)}% Complete</p>
                </div>
                <Button 
                    size="lg" 
                    disabled={progress < 100} 
                    onClick={onComplete}
                    className="glow-on-enable"
                >
                   Continue to Code Generation <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </motion.div>

        <CreateKeywordModal
            isOpen={isCreateModalOpen}
            setIsOpen={setCreateModalOpen}
            gherkinStep={selectedGherkinStep}
        />
         <RecordKeywordModal
            isOpen={isRecordModalOpen}
            setIsOpen={setRecordModalOpen}
            gherkinStep={selectedGherkinStep}
        />
        <ApiRequestModal
            isOpen={isApiModalOpen}
            setIsOpen={setApiModalOpen}
            gherkinStep={selectedGherkinStep}
        />
    </>
  );
}

    