
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Tags, GitBranch, Sparkles, Copy, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface GherkinPreparationViewProps {
  testCase: {
    id: string;
    summary: string;
  };
  steps: string[];
}

export function GherkinPreparationView({ testCase, steps }: GherkinPreparationViewProps) {
    const { toast } = useToast();
    const [tags, setTags] = useState<string[]>(["smoke-test", testCase.id.toLowerCase()]);
    const [currentTag, setCurrentTag] = useState("");

    const gherkinContent = `Feature: ${testCase.summary}

  @${tags.join(" @")}
  Scenario: ${testCase.summary}
    ${steps.join("\n    ")}
`;

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag) {
            e.preventDefault();
            if (!tags.includes(currentTag.trim())) {
                setTags([...tags, currentTag.trim()]);
            }
            setCurrentTag("");
        }
    }
    
    const handleCopy = () => {
        navigator.clipboard.writeText(gherkinContent);
        toast({ title: "Gherkin code copied to clipboard." });
    }
    
    const handleDownload = () => {
         const blob = new Blob([gherkinContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${testCase.id}.feature`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
         toast({ title: "Gherkin file downloaded." });
    }

  return (
    <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary"/>
                TestAI Lab: Gherkin Preparation
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Review the generated Gherkin feature file. Add tags and prepare for code generation.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Pane: Gherkin Editor */}
            <div className="lg:col-span-2">
                <Card className="relative">
                    <CardHeader>
                        <CardTitle>{testCase.id}.feature</CardTitle>
                        <CardDescription>This file will be the basis for your automation script.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/80 rounded-lg p-4 font-mono text-sm relative">
                            <pre className="whitespace-pre-wrap">
                                <span className="text-purple-600">Feature:</span>{` ${testCase.summary}\n\n  `}
                                <span className="text-green-600">@${tags.join(" @")}</span>{`\n  `}
                                <span className="text-purple-600">Scenario:</span>{` ${testCase.summary}\n`}
                                {steps.map((step, i) => {
                                    const keywordMatch = step.match(/^(Given|When|Then|And|But)/);
                                    if (keywordMatch) {
                                        return <div key={i}><span className="text-blue-600 font-semibold">{keywordMatch[0]}</span>{step.substring(keywordMatch[0].length)}</div>
                                    }
                                    return <div key={i}>{step}</div>
                                })}
                            </pre>
                             <div className="absolute top-4 right-4 flex gap-2">
                                <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={handleDownload}><Download className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Pane: Controls & Next Steps */}
            <div className="space-y-6 sticky top-20">
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><Tags className="h-5 w-5"/> Manage Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                             <AnimatePresence>
                                {tags.map(tag => (
                                    <motion.div
                                        key={tag}
                                        layout
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                    >
                                        <Badge 
                                            variant="secondary" 
                                            className="text-base py-1 px-3 cursor-pointer"
                                            onDoubleClick={() => setTags(tags.filter(t => t !== tag))}
                                        >
                                            {tag}
                                        </Badge>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <Input
                            placeholder="Add a tag and press Enter"
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={handleAddTag}
                        />
                    </CardContent>
                </Card>
                
                 <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                    <CardContent className="p-6 flex items-center justify-between">
                       <div>
                         <h3 className="font-bold">Ready for the next step?</h3>
                         <p className="text-sm opacity-80">Next, we'll map keywords and generate the code.</p>
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
