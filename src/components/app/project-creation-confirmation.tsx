
"use client";

import type { Project } from "@/lib/data";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle, ArrowRight, UserPlus, FileText, GitCommit, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface ProjectCreationConfirmationProps {
  project: Project;
  onContinue: () => void;
}

export function ProjectCreationConfirmation({
  project,
  onContinue,
}: ProjectCreationConfirmationProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8">
      <div className="max-w-4xl w-full text-center animate-in fade-in-50 zoom-in-95">
        <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Project Created Successfully</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your new project, "{project.name}", is ready and versioned.
        </p>

        <Card className="mt-8 text-left">
            <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>A baseline framework and Git repository skeleton were created.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                    <div>
                        <p className="font-semibold text-lg">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <Badge variant="outline">v1.0.0</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2"><GitCommit className="h-5 w-5" /> Initial Commit</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Scaffold created: README, config, minimal src/ structure.</li>
                            <li>Initial commit pushed to repository.</li>
                        </ul>
                    </div>
                     <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Team Members</h4>
                        <div className="flex flex-wrap gap-4">
                            {project.members.map(member => (
                                <div key={member.id} className="flex flex-col items-center gap-1.5 text-center">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={member.avatar} data-ai-hint="person face"/>
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium">{member.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                 <div className="border-t pt-6 space-y-3">
                    <p className="text-sm font-semibold">Next Steps</p>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-accent-foreground/80 text-sm">You can now integrate a Test Management Tool.</p>
                        <div className="flex gap-4">
                           <Button variant="default" onClick={onContinue}>
                                Open Project <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline">
                                Assign More Members <UserPlus className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
