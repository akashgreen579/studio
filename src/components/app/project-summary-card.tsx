
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Settings, ArrowRight, ShieldCheck } from "lucide-react";
import type { Project, User, Permissions } from "@/lib/data";
import { PermissionsEditor } from "./permissions-editor";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "../ui/badge";

interface ProjectSummaryCardProps {
  project: Project;
  currentUser: User;
  updateProjectPermissions: (
    projectId: string,
    permissions: Record<string, Partial<Permissions>>
  ) => void;
}

export function ProjectSummaryCard({
  project,
  currentUser,
  updateProjectPermissions,
}: ProjectSummaryCardProps) {
  const [isPermissionsEditorOpen, setIsPermissionsEditorOpen] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState("");
  const isOwner = project.owner.id === currentUser.id;

  useEffect(() => {
    setLastUpdatedText(formatDistanceToNow(project.lastUpdated, { addSuffix: true }));
    const timer = setInterval(() => {
        setLastUpdatedText(formatDistanceToNow(project.lastUpdated, { addSuffix: true }));
    }, 60000);
    return () => clearInterval(timer);
  }, [project.lastUpdated]);


  return (
    <>
      <Card className="flex flex-col border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="truncate">{project.name}</CardTitle>
              {isOwner && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                  Owner
                </Badge>
              )}
            </div>
          <CardDescription className="h-10 line-clamp-2 pt-1">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
             <div className="flex -space-x-2 overflow-hidden">
                {project.members.slice(0, 5).map(member => (
                    <Avatar key={member.id} className="h-8 w-8 inline-block border-2 border-background">
                        <AvatarImage src={member.avatar} data-ai-hint="person face" />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                ))}
                {project.members.length > 5 && (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted text-xs font-medium border-2 border-background">
                        +{project.members.length - 5}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.members.length} Members
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
           <div className="flex w-full justify-between items-center">
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsPermissionsEditorOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                </Button>
            </div>
             <Button size="sm" variant="secondary">
                Open <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           </div>
           <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground">Last updated {lastUpdatedText}</p>
                {isOwner && <p className="text-xs text-primary/80 font-medium">You are responsible for managing access and permissions.</p>}
           </div>
        </CardFooter>
      </Card>
      <PermissionsEditor
        isOpen={isPermissionsEditorOpen}
        setIsOpen={setIsPermissionsEditorOpen}
        project={project}
        currentUser={currentUser}
        updateProjectPermissions={updateProjectPermissions}
      />
    </>
  );
}
