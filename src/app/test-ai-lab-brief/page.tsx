"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, DraftingCompass, FileCode, GitBranch, LogIn, Monitor, MousePointer, Palette, Scale, Text, Zap, Accessibility, Wind, CheckCircle, FileText } from "lucide-react";

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
    <p className={`flex-1 ${className}`}>{`The quick brown fox jumps over the lazy dog`}</p>
    <p className="w-24 text-sm text-muted-foreground">{size}</p>
    <p className="w-20 text-sm text-muted-foreground">{weight}</p>
  </div>
);

const MotionSpec = ({ property, value, description }: { property: string; value: string; description: string }) => (
    <div className="flex items-center justify-between border-b py-3">
        <div>
            <p className="font-mono text-sm text-primary">{property}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">{value}</Badge>
    </div>
)

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
        <section className="grid md:grid-cols-3 gap-6 text-left">
            <Card className="border-accent/20 hover:border-accent/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Zap className="text-accent"/> Make Automation Safe</CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">Ensure generated code is repeatable, auditable, and staged securely until a user confirms the final push.</p></CardContent>
            </Card>
             <Card className="border-primary/20 hover:border-primary/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DraftingCompass className="text-primary"/> Provide a Clear Pipeline</CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">Guide users through a clear multi-stage process from NLP to Gherkin, code generation, and dry run.</p></CardContent>
            </Card>
             <Card className="border-amber-500/20 hover:border-amber-500/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GitBranch className="text-amber-500"/> Minimize Merge Conflicts</CardTitle>
                </CardHeader>
                <CardContent><p className="text-muted-foreground">Use a controlled commit flow to reduce conflicts and streamline the code integration process.</p></CardContent>
            </Card>
        </section>

        {/* Entry Points */}
        <section>
            <h2 className="text-3xl font-semibold mb-6 text-center">User Flow Entry Points</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 rounded-lg border p-4 bg-card">
                    <LogIn className="h-8 w-8 text-primary"/>
                    <div>
                        <h3 className="font-semibold">1. TMT View: "Automate"</h3>
                        <p className="text-sm text-muted-foreground">Primary entry. A user selects a single test case and clicks "Automate" to start the folder validation and generation workflow.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4 rounded-lg border p-4 bg-card">
                    <LogIn className="h-8 w-8 text-primary"/>
                    <div>
                        <h3 className="font-semibold">2. Dashboard: "Drafts"</h3>
                        <p className="text-sm text-muted-foreground">Users can resume work on partially completed automation scripts from their personal dashboard.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4 bg-card">
                    <LogIn className="h-8 w-8 text-primary"/>
                    <div>
                        <h3 className="font-semibold">3. Direct Open</h3>
                        <p className="text-sm text-muted-foreground">A user can open the Lab directly to start a new script from scratch or to review a completed one via a direct link.</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Design Tokens */}
        <section className="space-y-12">
            <div className="text-center">
                <h2 className="text-3xl font-semibold">Design Tokens (Global)</h2>
                <p className="text-muted-foreground mt-2">Core visual properties for the TestAI Lab interface and the entire application.</p>
            </div>

            {/* Colors */}
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Palette/> Color System</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                   <ColorSwatch name="Primary" className="bg-primary" hex="#163f7a" description="Deep Indigo for primary actions, active states, and links." />
                   <ColorSwatch name="Background" className="bg-background" hex="#F6F7F9" description="The main canvas color for a clean, spacious feel." />
                   <ColorSwatch name="Surface" className="bg-card" hex="#FFFFFF" description="For primary content panes like cards, modals, and panels." />
                   <ColorSwatch name="Accent" className="bg-accent" hex="#17A589" description="Teal for success states, confirmations, and positive feedback." />
                   <ColorSwatch name="Warning" className="bg-yellow-500" hex="#F6A623" description="Amber for warnings, in-progress states, and areas needing attention." />
                   <ColorSwatch name="Danger" className="bg-destructive" hex="#E04545" description="For errors, destructive actions, and critical alerts." />
                </CardContent>
            </Card>

            {/* Typography */}
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Text/> Typography</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <TypoSample name="Heading 1" size="2.25rem" weight="Bold" className="text-4xl font-bold" />
                    <TypoSample name="Heading 2" size="1.875rem" weight="Semi-bold" className="text-3xl font-semibold" />
                    <TypoSample name="Body" size="1rem" weight="Regular" className="text-base" />
                    <p className="mt-4 text-sm text-muted-foreground">Use <code className="font-mono bg-muted px-1 rounded">Inter</code> for all UI text to ensure clarity and readability.</p>
                </CardContent>
            </Card>

            {/* Spacing & Motion */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Scale/> Spacing Grid</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Based on an 8px grid system. Use Tailwind's spacing scale for consistency.</p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-sm">
                            <li><span className="font-medium">p-2 (8px):</span> Inner padding for small elements.</li>
                            <li><span className="font-medium">p-4 (16px):</span> Content padding inside cards.</li>
                            <li><span className="font-medium">p-6 (24px):</span> Gutters between major layout panes.</li>
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Wind/> Motion System</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <MotionSpec property="--ease-standard" value="cubic-bezier(0.2, 0.8, 0.2, 1)" description="Standard elegant easing for all transitions."/>
                        <MotionSpec property="--duration-moderate" value="200-320ms" description="For component and panel transitions."/>
                        <MotionSpec property="--stagger-fast" value="60-100ms" description="For animating lists or staggered elements."/>
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* Deliverables */}
        <section>
            <h2 className="text-3xl font-semibold mb-6 text-center">Core Deliverables</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <DeliverableItem title="1. TestAI Lab Screens" description="High-fidelity mockups for the main multi-pane view, including responsive variants for desktop and tablet." icon={Monitor}/>
                <DeliverableItem title="2. Interactive Prototype" description="A working prototype demonstrating the end-to-end flow, from step generation and code refinement to the final dry run." icon={MousePointer}/>
                <DeliverableItem title="3. Component Library" description="Reusable components for the stepper, code viewer, simulation window, and staging area." icon={FileCode}/>
                <DeliverableItem title="4. Motion & Accessibility Spec" description="Documentation for all key animations and accessibility requirements, including reduced motion variants." icon={Wind}/>
                <DeliverableItem title="5. Microcopy & QA Checklist" description="All user-facing text and a comprehensive checklist for QA acceptance testing." icon={FileText}/>
                <DeliverableItem title="6. Git Integration Flow" description="UI and logic for committing the generated script to a new branch in a controlled, safe manner." icon={GitBranch}/>
            </div>
        </section>

        {/* Considerations */}
        <section>
             <h2 className="text-3xl font-semibold mb-6 text-center">Key Considerations</h2>
             <div className="grid md:grid-cols-2 gap-8 text-left">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Accessibility/> Accessibility</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                        <p>All interactive elements must be keyboard-navigable and have clear focus states.</p>
                        <p>Ensure sufficient color contrast for all text and UI elements.</p>
                        <p>Implement a "reduced motion" mode that disables non-essential animations.</p>
                        <p>Use ARIA attributes to describe dynamic content regions and live updates from the AI.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Monitor/> Responsiveness</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Desktop (1280px+):</span> Full three-pane layout (Navigator, Editor, Terminal).</p>
                        <p><span className="font-semibold text-foreground">Tablet (768px+):</span> Tabbed interface to switch between Editor and Terminal panes to conserve space.</p>
                        <p><span className="font-semibold text-foreground">Mobile (&lt;768px):</span> A "desktop required" message should be displayed, as the Lab is not designed for mobile use in v1.</p>
                    </CardContent>
                </Card>
             </div>
        </section>

    </div>
  );
}
