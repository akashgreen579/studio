"use client";

import { useState } from "react";
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
import { Users, Settings, ArrowRight } from "lucide-react";
import type { Project, User, Permissions } from "@/lib/data";
import { PermissionsEditor } from "./permissions-editor";
import { formatDistanceToNow } from 'date-fns';

interface ProjectSummaryCardProps {
  project: Project;
  currentUser: User;
  updateProjectPermissions: (
    projectId: string,
    permissions: Record<string, Permissions>
  ) => void;
}

export function ProjectSummaryCard({
  project,
  currentUser,
  updateProjectPermissions,
}: ProjectSummaryCardProps) {
  const [isPermissionsEditorOpen, setIsPermissionsEditorOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="truncate">{project.name}</CardTitle>
          <CardDescription className="h-10 line-clamp-2">{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={project.owner.avatar} data-ai-hint="person face" />
                <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{project.owner.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.members.length}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
           <div className="flex w-full justify-between items-center">
             <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsPermissionsEditorOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Permissions
                </Button>
                <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Assign
                </Button>
            </div>
             <Button size="sm">
                Open Project <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           </div>
           <p className="text-xs text-muted-foreground">Last updated {formatDistanceToNow(project.lastUpdated, { addSuffix: true })}</p>
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
