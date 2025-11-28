"use client";

import type { Project } from "@/lib/data";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle, ArrowRight, UserPlus } from "lucide-react";
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
      <Card className="max-w-3xl w-full text-center shadow-2xl animate-in fade-in-50 zoom-in-95">
        <CardHeader className="items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl">Project Created Successfully</CardTitle>
          <CardDescription>
            Your new project, "{project.name}", is ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Project Details</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="space-y-3">
             <h3 className="font-semibold">Team Members Assigned</h3>
            <div className="flex justify-center flex-wrap gap-4">
                {project.members.map(member => (
                    <div key={member.id} className="flex flex-col items-center gap-2">
                         <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} data-ai-hint="person face" />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.name}</span>
                        {member.id === project.owner.id && <Badge variant="outline">Owner</Badge>}
                    </div>
                ))}
            </div>
          </div>
           <div className="border-t pt-6 flex justify-center gap-4">
                <Button onClick={onContinue}>
                    <ArrowRight className="mr-2" /> Go to Dashboard
                </Button>
                <Button variant="outline">
                    <UserPlus className="mr-2" /> Assign More Members
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
