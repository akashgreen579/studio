"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, DraftingCompass, FileCode, GitBranch, LogIn, Monitor, MousePointer, Palette, Scale3d, Text, Zap, Accessibility, Wind } from "lucide-react";

const ColorSwatch = ({ name, className, hex, description }: { name: string, className: string, hex: string, description: string }) => (
  <div className="flex items-start gap-4">
    <div className={`h-16 w-16 rounded-lg shadow-inner ${className} border flex-shrink-0`}></div>
    <div>
      <p className="font-medium">{name} <span className="text-muted-foreground font-mono text-xs">{hex}</span></p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const TypoSample = ({ name, size, weight, className }: { name: string; size: string; weight: string; className: string }) => (
  <div className="flex items-baseline space-x-4 border-b pb-2">
    <p className="w-32 text-sm text-muted-foreground">{name}</p>
    <p className={`flex-1 ${className}`}>The quick brown fox jumps over the lazy dog</p>
    <p className="w-24 text-sm text-muted-foreground">{size}</p>
    <p className="w-20 text-sm text-muted-foreground">{weight}</p>
  </div>
);

const MotionSpec = ({ property, value, description }: { property: string; value: string; description: string }) => (
    <div className="flex items-center justify-between border-b py-3">
        <div>
            <p className="font-mono text-sm text-purple-600">{property}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">{value}</Badge>
    </div>
);

const DeliverableItem = ({ title, description, icon: Icon }: { title: string, description: string, icon: React.ElementType }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/40">
        <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1"/>
        <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

export default function TestAiLabBriefPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-16 bg-background text-foreground">
        <header className="space-y-4 text-center">
            <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Bot className="h-6 w-6" />
                <span className="font-semibold">Project Brief & Style Guide</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">TestAI Lab</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                An intelligent, multi-pane workspace for generating, refining, and validating test automation scripts with AI assistance.
            </p>
        </header>

        {/* Project Goals */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <Card className="border-green-500/20 hover:border-green-500/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Zap className="text-green-500"/> Accelerate Automation</CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">Drastically reduce the time from test case creation to a committed, working automation script.</p></CardContent>
            </Card>
             <Card className="border-blue-500/20 hover:border-blue-500/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DraftingCompass className="text-blue-500"/> Improve Quality & Consistency</CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">Standardize script structure, improve code quality with AI review, and reduce human error.</p></CardContent>
            </Card>
             <Card className="border-purple-500/20 hover:border-purple-500/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MousePointer className="text-purple-500"/> Empower All Skill Levels</CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">Enable manual testers to generate baseline scripts, while providing powerful tools for experienced SDETs.</p></CardContent>
            </Card>
        </section>

        {/* Entry Points */}
        <section>
            <h2 className="text-3xl font-semibold mb-6 text-center">User Flow Entry Points</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 rounded-lg border p-4 bg-card">
                    <LogIn className="h-8 w-8 text-primary"/>
                    <div>
                        <h3 className="font-semibold">1. TMT View: "Automate" Button</h3>
                        <p className="text-sm text-muted-foreground">Primary entry point. User selects a test case and clicks "Automate" to initiate the workflow.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4 rounded-lg border p-4 bg-card">
                    <LogIn className="h-8 w-8 text-primary"/>
                    <div>
                        <h3 className="font-semibold">2. Dashboard: "Drafts" Card</h3>
                        <p className="text-sm text-muted-foreground">Users can resume work on partially completed automation scripts from their dashboard.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4 bg-card">
                    <LogIn className="h-8 w-8 text-primary"/>
                    <div>
                        <h3 className="font-semibold">3. Direct URL / Lab Link</h3>
                        <p className="text-sm text-muted-foreground">Opening the Lab directly, possibly to create a new script from scratch or review a completed one.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Design Tokens */}
        <section className="space-y-12">
            <div className="text-center">
                <h2 className="text-3xl font-semibold">Design Tokens</h2>
                <p className="text-muted-foreground mt-2">Core visual properties for the TestAI Lab interface.</p>
            </div>

            {/* Colors */}
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette/> Color System</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                   <ColorSwatch name="Lab Background" className="bg-background" hex="#E8E8EA" description="The main canvas color. Clean and non-distracting." />
                   <ColorSwatch name="Lab Panel" className="bg-card" hex="#FFFFFF" description="For primary content panes like the code editor and steps view." />
                   <ColorSwatch name="AI Accent" className="bg-purple-500" hex="#8B5CF6" description="Used for AI-generated content, suggestions, and primary generative actions." />
                   <ColorSwatch name="AI Accent (Muted)" className="bg-purple-100" hex="#EDE9FE" description="Background for AI suggestion chips and highlights." />
                   <ColorSwatch name="Execution/Live" className="bg-green-500" hex="#22C55E" description="Indicates live execution, successful steps, and confirmation." />
                   <ColorSwatch name="Warning/Diff" className="bg-amber-500" hex="#F59E0B" description="For warnings, diff highlights, and areas needing user attention." />
                </CardContent>
            </Card>

            {/* Typography */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Text/> Typography (Inter & Fira Code)</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <TypoSample name="Pane Title" size="1.25rem" weight="Semi-bold" className="text-xl font-semibold" />
                    <TypoSample name="Section Header" size="1rem" weight="Medium" className="text-base font-medium" />
                    <TypoSample name="Body Text" size="0.875rem" weight="Regular" className="text-sm" />
                    <p className="mt-4 text-sm text-muted-foreground">For code blocks and terminal output, use <code className="font-mono bg-muted px-1 rounded">Fira Code</code>.</p>
                </CardContent>
            </Card>

            {/* Spacing & Motion */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Scale3d/> Spacing Grid</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Based on a 4px grid system. Use Tailwind's spacing scale (e.g., p-4, gap-2).</p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-sm">
                            <li><span className="font-medium">p-2 (8px):</span> Inner padding for small elements (badges, inputs).</li>
                            <li><span className="font-medium">p-4 (16px):</span> Content padding inside cards and panels.</li>
                            <li><span className="font-medium">p-6 (24px):</span> Gutter between major layout panes.</li>
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Wind/> Motion System</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <MotionSpec property="--ease-lab" value="cubic-bezier(0.32, 0.72, 0, 1)" description="A swift, elegant curve for UI transitions."/>
                        <MotionSpec property="--duration-quick" value="150ms" description="Micro-interactions, hover effects."/>
                        <MotionSpec property="--duration-fluid" value="300ms" description="Panel transitions, modal popups."/>
                        <MotionSpec property="--duration-deliberate" value="500ms" description="Full-screen layout shifts."/>
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* Deliverables */}
        <section>
            <h2 className="text-3xl font-semibold mb-6 text-center">Project Deliverables</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <DeliverableItem title="1. TestAI Lab Screen" description="The main multi-pane view including test steps, code editor, and execution terminal." icon={Monitor}/>
                <DeliverableItem title="2. Interactive Prototype" description="A high-fidelity prototype demonstrating the end-to-end flow from step generation to code commit." icon={MousePointer}/>
                <DeliverableItem title="3. Component Specs" description="Reusable components for test steps, AI suggestions, code blocks, and terminal output." icon={FileCode}/>
                <DeliverableItem title="4. Motion Spec" description="Documentation for all key animations, including pane transitions and AI feedback loops." icon={Wind}/>
                <DeliverableItem title="5. Microcopy File" description="All user-facing text for modals, tooltips, empty states, and instructional overlays." icon={Text}/>
                <DeliverableItem title="6. Git Integration Flow" description="UI and logic for committing the generated script to a new branch in the project's Git repository." icon={GitBranch}/>
            </div>
        </section>

        {/* Considerations */}
        <section>
             <h2 className="text-3xl font-semibold mb-6 text-center">Key Considerations</h2>
             <div className="grid md:grid-cols-2 gap-8 text-left">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Accessibility/> Accessibility</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                        <p>All interactive elements must be keyboard-navigable.</p>
                        <p>Ensure sufficient color contrast, especially for AI-highlighted text.</p>
                        <p>Implement a "reduced motion" mode that disables non-essential animations.</p>
                        <p>Use ARIA attributes to describe dynamic content regions and live updates.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Monitor/> Responsiveness</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Desktop (1280px+):</span> Full three-pane layout (Navigator, Editor, Terminal).</p>
                        <p><span className="font-semibold text-foreground">Tablet (768px+):</span> Tabbed interface to switch between Editor and Terminal panes.</p>
                        <p><span className="font-semibold text-foreground">Mobile (&lt;768px):</span> Not officially supported for v1, but should display a "desktop required" message.</p>
                    </CardContent>
                </Card>
             </div>
        </section>

    </div>
  );
}
