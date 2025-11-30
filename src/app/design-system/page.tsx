
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FolderPlus, GitMerge, Palette, Home, Users, Settings, ScrollText, FileCheck } from "lucide-react";
import microcopy from "@/lib/microcopy.json";

const ColorSwatch = ({ name, className, hex }: { name: string; className: string; hex: string }) => (
  <div className="flex flex-col items-center space-y-2">
    <div className={`h-20 w-20 rounded-lg shadow-inner ${className} border`}></div>
    <div className="text-center">
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{hex}</p>
    </div>
  </div>
);

const TypoSample = ({ name, size, weight, className }: { name: string; size: string; weight: string; className: string }) => (
  <div className="flex items-baseline space-x-4 border-b pb-2">
    <p className="w-24 text-sm text-muted-foreground">{name}</p>
    <p className={`flex-1 ${className}`}>The quick brown fox jumps over the lazy dog</p>
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

export default function DesignSystemPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
        <header className="space-y-2">
            <div className="flex items-center gap-3">
                <Palette className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight">TestCraft AI Design System</h1>
            </div>
            <p className="text-lg text-muted-foreground">The single source of truth for visual design, components, and brand identity.</p>
        </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palette</h2>
        <Card>
          <CardContent className="p-6 grid grid-cols-3 md:grid-cols-6 gap-6">
            <ColorSwatch name="Primary" className="bg-primary" hex="#293B5F" />
            <ColorSwatch name="Background" className="bg-background" hex="#E8E8EA" />
            <ColorSwatch name="Accent" className="bg-accent" hex="#845EC2" />
            <ColorSwatch name="Card" className="bg-card" hex="#FFFFFF" />
            <ColorSwatch name="Destructive" className="bg-destructive" hex="#DC2626" />
            <ColorSwatch name="Ring" className="bg-ring" hex="#845EC2" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <Card>
            <CardHeader>
                <CardTitle>Font: Inter</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <TypoSample name="Heading 1" size="2.25rem" weight="Bold" className="text-4xl font-bold" />
                <TypoSample name="Heading 2" size="1.875rem" weight="Semi-bold" className="text-3xl font-semibold" />
                <TypoSample name="Heading 3" size="1.5rem" weight="Semi-bold" className="text-2xl font-semibold" />
                <TypoSample name="Body" size="1rem" weight="Regular" className="text-base" />
                <TypoSample name="Small" size="0.875rem" weight="Medium" className="text-sm font-medium" />
            </CardContent>
        </Card>
      </section>
      
       <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Iconography</h2>
        <Card>
          <CardHeader>
            <CardTitle>Lucide Icons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
             <CheckCircle className="h-6 w-6"/>
             <FolderPlus className="h-6 w-6"/>
             <GitMerge className="h-6 w-6"/>
             <Palette className="h-6 w-6"/>
             <Home className="h-6 w-6"/>
             <Users className="h-6 w-6"/>
             <Settings className="h-6 w-6"/>
             <ScrollText className="h-6 w-6"/>
             <FileCheck className="h-6 w-6"/>
          </CardContent>
           <CardContent>
            <p className="text-sm text-muted-foreground">The app primarily uses icons from the <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary underline">lucide-react</a> library. Use icons consistently to represent actions.</p>
           </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Motion System</h2>
        <Card>
            <CardHeader>
                <CardTitle>Animation & Transitions</CardTitle>
                <p className="text-muted-foreground">Motion should be purposeful, providing feedback and guiding the user without being distracting.</p>
            </CardHeader>
            <CardContent className="space-y-2">
                <MotionSpec property="--ease-standard" value="cubic-bezier(0.4, 0, 0.2, 1)" description="Standard easing for most transitions."/>
                <MotionSpec property="--duration-fast" value="150ms" description="For micro-interactions like hover effects."/>
                <MotionSpec property="--duration-moderate" value="300ms" description="For component transitions like modal popups."/>
                <MotionSpec property="--duration-slow" value="500ms" description="For larger screen or layout transitions."/>
            </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Microcopy</h2>
        <Card>
            <CardHeader>
                <CardTitle>UI Text & Messaging</CardTitle>
            </CardHeader>
             <CardContent>
                <p className="mb-4">All user-facing text is stored in <code className="bg-muted px-1 py-0.5 rounded text-primary font-mono text-sm">src/lib/microcopy.json</code>. This allows for easy updates and future localization.</p>
                <a href="/microcopy.json" download="microcopy.json" className="inline-block">
                    <Button variant="outline">Download Microcopy File</Button>
                </a>
             </CardContent>
        </Card>
      </section>
      
       <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Responsiveness</h2>
        <Card>
            <CardHeader>
                <CardTitle>Breakpoints</CardTitle>
            </CardHeader>
             <CardContent>
                 <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Mobile (sm):</span> `640px`. Stacks layouts vertically, sidebars become drawers.</li>
                    <li><span className="font-semibold text-foreground">Tablet (md):</span> `768px`. Two-column layouts become feasible.</li>
                    <li><span className="font-semibold text-foreground">Laptop (lg):</span> `1024px`. Full three-column layouts, expanded sidebars.</li>
                    <li><span className="font-semibold text-foreground">Desktop (xl):</span> `1280px`. Wider content areas and more spacing.</li>
                 </ul>
             </CardContent>
        </Card>
      </section>

    </div>
  );
}
