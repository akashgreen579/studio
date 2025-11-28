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
import { Button } from "../ui/button";
import { ArrowRight, Shield } from "lucide-react";

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
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle>{project.name}</CardTitle>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 hover:bg-teal-200">
                Team Member
            </Badge>
        </div>
        <CardDescription className="h-10 line-clamp-2 pt-1">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <h4 className="text-sm font-semibold mb-3">Your Permissions</h4>
        <div className="flex flex-wrap gap-2">
          <TooltipProvider delayDuration={100}>
            {activePermissions.length > 0 ? (
              activePermissions.map((key) => {
                const perm = permissionDescriptions[key];
                const Icon = perm.icon;
                return (
                    <Tooltip key={key}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className="font-normal gap-2 text-muted-foreground">
                            <Icon className="h-4 w-4"/>
                            <span>{perm.label}</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{perm.description}</p>
                    </TooltipContent>
                    </Tooltip>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No specific permissions assigned.</p>
            )}
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
          <Button>
              Open Project <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Shield className="h-3 w-3" /> Managed by {project.owner.name}
        </p>
      </CardFooter>
    </Card>
  );
}
