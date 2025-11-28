"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Project, User, Permissions } from "@/lib/data";
import { permissionDescriptions } from "@/lib/data";

interface EmployeeProjectCardProps {
  project: Project;
  user: User;
}

export function EmployeeProjectCard({ project, user }: EmployeeProjectCardProps) {
  const userPermissions = project.permissions[user.id];

  const getActivePermissions = () => {
    if (!userPermissions) return [];
    return Object.entries(userPermissions)
      .filter(([, value]) => value)
      .map(([key]) => key as keyof Permissions);
  };

  const activePermissions = getActivePermissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className="h-10 line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Your Permissions:</h4>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider delayDuration={100}>
            {activePermissions.length > 0 ? (
              activePermissions.map((key) => (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary">{permissionDescriptions[key].badge}</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{permissionDescriptions[key].label}</p>
                  </TooltipContent>
                </Tooltip>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No specific permissions assigned.</p>
            )}
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Assigned by {project.owner.name}
        </p>
      </CardFooter>
    </Card>
  );
}
