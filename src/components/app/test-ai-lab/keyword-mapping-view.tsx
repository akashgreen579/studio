
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, Wand, RefreshCw } from "lucide-react";
import { existingKeywords, type ExistingKeyword, type TestCase } from "@/lib/data";
import { AnimatePresence, motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { KeywordMappingCard } from "./keyword-mapping-card";
import { CreateKeywordModal, RecordKeywordModal } from "./keyword-action-modals";

interface KeywordMappingViewProps {
  testCase: TestCase;
  steps: string[];
  onComplete: () => void;
}

export type StepMapping = {
  gherkinStep: string;
  suggestion: ExistingKeyword | null;
  similarity: number | null;
  action: "reuse" | "create" | "record" | "pending";
  status: "pending" | "resolved";
};

// A simple fuzzy match function for demonstration
const fuzzyMatch = (step1: string, step2: string): number => {
    const s1 = step1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const s2 = step2.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length >= s2.length ? s1 : s2;
    if (longer.length === 0) return 1.0;
    const longerTokens = new Set(longer.split(' '));
    const shorterTokens = shorter.split(' ');
    const matchingTokens = shorterTokens.filter(token => longerTokens.has(token));
    return (matchingTokens.length / longerTokens.size) * 100;
}

export function KeywordMappingView({ testCase, steps, onComplete }: KeywordMappingViewProps) {
    const [autoSuggest, setAutoSuggest] = useState(true);
    const [similarityThreshold, setSimilarityThreshold] = useState(80);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isRecordModalOpen, setRecordModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState<StepMapping | null>(null);

    const initialMappings = useMemo((): StepMapping[] => {
        return steps.map(step => {
            let bestMatch: ExistingKeyword | null = null;
            let bestSimilarity = 0;

            for (const keyword of existingKeywords) {
                const similarity = fuzzyMatch(step, keyword.stepText);
                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatch = keyword;
                }
            }
            
            return {
                gherkinStep: step,
                suggestion: autoSuggest && bestSimilarity > 50 ? bestMatch : null,
                similarity: autoSuggest && bestSimilarity > 50 ? bestSimilarity : null,
                action: "pending",
                status: "pending"
             }
        });
    }, [steps, autoSuggest]);
    
    const [mappings, setMappings] = useState<StepMapping[]>(initialMappings);

    useEffect(() => {
        setMappings(initialMappings);
    }, [initialMappings]);

    const handleUpdateMapping = (index: number, newMapping: Partial<StepMapping>) => {
        setMappings(prev => {
            const newMappings = [...prev];
            newMappings[index] = { ...newMappings[index], ...newMapping };
            return newMappings;
        });
    };
    
    const openCreateModal = (mapping: StepMapping, index: number) => {
        setSelectedStep(mapping);
        setCreateModalOpen(true);
    }
    
    const openRecordModal = (mapping: StepMapping, index: number) => {
        setSelectedStep(mapping);
        setRecordModalOpen(true);
    }

    const handleReuseAll = () => {
        setMappings(prev => prev.map(m => {
            if (m.suggestion && m.similarity && m.similarity >= similarityThreshold) {
                return { ...m, action: 'reuse', status: 'resolved' };
            }
            return m;
        }));
    };
    
    const progress = useMemo(() => {
        const resolvedCount = mappings.filter(m => m.status === 'resolved').length;
        return (resolvedCount / mappings.length) * 100;
    }, [mappings]);

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
                     <AnimatePresence>
                        {mappings.map((mapping, index) => (
                             <motion.div 
                                key={mapping.gherkinStep}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, ease: "circOut" }}
                             >
                                <KeywordMappingCard
                                    mapping={mapping}
                                    onUpdate={(newMapping) => handleUpdateMapping(index, newMapping)}
                                    onCreate={() => openCreateModal(mapping, index)}
                                    onRecord={() => openRecordModal(mapping, index)}
                                />
                             </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                
                {/* Right Sidebar */}
                <div className="space-y-6 sticky top-20">
                    <Card className="shadow-subtle">
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

                             <Button className="w-full" onClick={handleReuseAll} disabled={!autoSuggest}>
                               <Wand className="h-4 w-4 mr-2"/> Reuse all suggestions ≥ {similarityThreshold}%
                            </Button>
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
                                <span>{mappings.filter(m => m.status === 'resolved').length} / {mappings.length}</span>
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
                   Continue to Action Simulation <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </motion.div>
        
        <CreateKeywordModal
            isOpen={isCreateModalOpen}
            setIsOpen={setCreateModalOpen}
            gherkinStep={selectedStep?.gherkinStep || ""}
        />
        <RecordKeywordModal
            isOpen={isRecordModalOpen}
            setIsOpen={setRecordModalOpen}
            gherkinStep={selectedStep?.gherkinStep || ""}
        />
    </>
  );
}

