
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, GitBranch, Sparkles, Copy, Download, TestTube, FileCode, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatedCode } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CodeGenerationViewProps {
  testCase: {
    id: string;
    summary: string;
  };
  onRestart: () => void;
}

const CodeBlock = ({ content, onCopy, onDownload }: { content: string, onCopy: () => void, onDownload: () => void }) => (
    <div className="bg-muted/80 rounded-lg font-mono text-xs relative h-full">
        <pre className="whitespace-pre-wrap p-4 overflow-auto h-full">{content}</pre>
        <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="icon" onClick={onCopy}><Copy className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" onClick={onDownload}><Download className="h-4 w-4"/></Button>
        </div>
    </div>
);


export function CodeGenerationView({ testCase, onRestart }: CodeGenerationViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("page-object");

    const handleCopy = (content: string, fileName: string) => {
        navigator.clipboard.writeText(content);
        toast({ title: `${fileName} copied to clipboard.` });
    }
    
    const handleDownload = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        toast({ title: `Downloaded ${fileName}.` });
    }

  return (
    <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <FileCode className="h-8 w-8 text-primary"/>
                TestAI Lab: Code Generation & Refinement
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Review, refine, and stage the AI-generated automation code.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Pane: Code Preview */}
            <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="page-object">Page Object</TabsTrigger>
                        <TabsTrigger value="step-def">Step Definition</TabsTrigger>
                        <TabsTrigger value="diff-view">Diff View <Badge className="ml-2">3</Badge></TabsTrigger>
                    </TabsList>
                    <Card className="mt-4 h-[600px]">
                        <CardContent className="p-2 h-full">
                            <TabsContent value="page-object" className="m-0 h-full">
                                <CodeBlock 
                                    content={generatedCode.pageObject}
                                    onCopy={() => handleCopy(generatedCode.pageObject, 'LoginPage.java')}
                                    onDownload={() => handleDownload(generatedCode.pageObject, 'LoginPage.java')}
                                />
                            </TabsContent>
                             <TabsContent value="step-def" className="m-0 h-full">
                                <CodeBlock 
                                    content={generatedCode.stepDefinition}
                                    onCopy={() => handleCopy(generatedCode.stepDefinition, 'LoginSteps.java')}
                                    onDownload={() => handleDownload(generatedCode.stepDefinition, 'LoginSteps.java')}
                                />
                            </TabsContent>
                             <TabsContent value="diff-view" className="m-0 h-full">
                                <div className="p-4 h-full flex items-center justify-center text-center">
                                    <p className="text-muted-foreground">Diff view would show changes against existing files.</p>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>

             {/* Right Pane: Actions & Next Steps */}
            <div className="space-y-6 sticky top-20">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500"/> AI Refinement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Use AI to add assertions, improve locators, or add comments to your generated code.</p>
                        <Button className="w-full" variant="outline">
                            Refine Code with AI
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5 text-blue-500"/> Dry Run</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <p className="text-sm text-muted-foreground">Run the generated script in a sandboxed environment to validate its correctness before staging.</p>
                         <Button className="w-full">
                           Start Dry Run
                        </Button>
                    </CardContent>
                </Card>

                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 !text-green-600"/>
                    <AlertTitle className="text-green-900">Ready to Complete?</AlertTitle>
                    <AlertDescription className="text-green-800">
                        Once you're satisfied, stage the code. A merge request will be created for review.
                         <div className="mt-4 flex gap-2">
                             <Button size="sm" variant="secondary" onClick={onRestart}>
                                <RefreshCw className="h-4 w-4 mr-2"/> Start Over
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                <GitBranch className="h-4 w-4 mr-2"/> Stage & Commit
                            </Button>
                         </div>
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    </div>
  );
}
