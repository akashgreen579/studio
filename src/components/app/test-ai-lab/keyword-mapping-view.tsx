
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowRight, Link2, GitBranch, Sparkles, Copy, Download, Search, Info, PlusCircle, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { existingKeywords, type ExistingKeyword } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

interface KeywordMappingViewProps {
  testCase: {
    id: string;
    summary: string;
  };
  steps: string[];
}

type StepMapping = {
  gherkinStep: string;
  suggestion: ExistingKeyword | null;
  similarity: number | null;
  action: "reuse" | "create" | "ignore";
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

export function KeywordMappingView({ testCase, steps }: KeywordMappingViewProps) {
    const { toast } = useToast();
    const [autoSuggest, setAutoSuggest] = useState(true);

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
            
            if (bestSimilarity > 70) {
                 return {
                    gherkinStep: step,
                    suggestion: bestMatch,
                    similarity: bestSimilarity,
                    action: "reuse"
                 }
            }

            return {
                gherkinStep: step,
                suggestion: null,
                similarity: null,
                action: "create"
            }
        });
    }, [steps]);
    
    const [mappings, setMappings] = useState<StepMapping[]>(initialMappings);

    const handleActionChange = (index: number, action: "reuse" | "create") => {
        setMappings(prev => {
            const newMappings = [...prev];
            newMappings[index].action = action;
            return newMappings;
        })
    }
    
    const getSimilarityBadge = (similarity: number | null) => {
        if (!similarity) return null;
        if (similarity > 95) return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">Exact Match</Badge>
        if (similarity > 80) return <Badge variant="secondary" className="bg-sky-100 text-sky-800 border-sky-300">{Math.round(similarity)}% Similar</Badge>
        if (similarity > 70) return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">{Math.round(similarity)}% Similar</Badge>
        return <Badge variant="outline">{Math.round(similarity)}% Similar</Badge>
    }

  return (
    <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Link2 className="h-8 w-8 text-primary"/>
                TestAI Lab: Keyword Mapping
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Map Gherkin steps to reusable code keywords or create new ones.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Step to Keyword Mapping</CardTitle>
                        <CardDescription>Review the AI's suggestions for mapping your test steps to existing code keywords.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Gherkin Step</TableHead>
                                    <TableHead>Suggested Keyword</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {mappings.map((mapping, index) => (
                                         <motion.tr 
                                            key={index} 
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                         >
                                            <TableCell className="font-medium">{mapping.gherkinStep}</TableCell>
                                            <TableCell>
                                                {mapping.suggestion && autoSuggest ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {getSimilarityBadge(mapping.similarity)}
                                                            <p className="text-sm truncate">{mapping.suggestion.stepText}</p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{mapping.suggestion.filePath}</p>
                                                    </div>
                                                ) : (
                                                     <p className="text-sm text-muted-foreground italic">No suggestion</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {mapping.action === "reuse" && mapping.suggestion && autoSuggest ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Button variant="secondary" size="sm">Reuse</Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleActionChange(index, "create")}>Create New</Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 justify-center">
                                                         <Button variant="outline" size="sm"><PlusCircle className="h-4 w-4 mr-2"/>Create</Button>
                                                         <Button variant="outline" size="sm"><Video className="h-4 w-4 mr-2"/>Record</Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-6 sticky top-20">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5"/> AI Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="auto-suggest-toggle" checked={autoSuggest} onCheckedChange={setAutoSuggest}/>
                            <Label htmlFor="auto-suggest-toggle">Auto-Suggest Reuse</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Automatically suggest reusing existing keywords that are a fuzzy match with your Gherkin steps.</p>
                         <Button className="w-full" disabled={!autoSuggest}>
                           Reuse all suggestions &gt; 80%
                        </Button>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                    <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <h3 className="font-bold">Ready to generate code?</h3>
                         <p className="text-sm opacity-80">Next, we'll generate the boilerplate code.</p>
                       </div>
                        <Button variant="secondary" size="lg">
                           Continue <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

    