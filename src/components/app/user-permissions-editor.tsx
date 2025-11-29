
"use client";

import { useState, useMemo, useEffect } from "react";
import type { User, Project, Permissions, Role } from "@/lib/data";
import { permissionPresets, getEffectivePermissions, permissionDescriptions, allUsers } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserPermissionsEditorProps {
    user: User;
    projects: Project[];
}

export function UserPermissionsEditor({ user: initialUser, projects }: UserPermissionsEditorProps) {
    const [user, setUser] = useState<User>(initialUser);
    // This local state will track permission changes before saving.
    const [projectPermissions, setProjectPermissions] = useState<Record<string, Partial<Permissions>>>(() => {
        const perms: Record<string, Partial<Permissions>> = {};
        projects.forEach(p => {
            if (p.permissions[user.id]) {
                perms[p.id] = p.permissions[user.id];
            }
        });
        return perms;
    });

    const { toast } = useToast();

    useEffect(() => {
        setUser(initialUser);
        const perms: Record<string, Partial<Permissions>> = {};
        projects.forEach(p => {
            if (p.permissions[initialUser.id]) {
                perms[p.id] = p.permissions[initialUser.id];
            }
        });
        setProjectPermissions(perms);
    }, [initialUser, projects]);


    const handlePermissionChange = (projectId: string, permissionKey: keyof Permissions, value: boolean) => {
        setProjectPermissions(prev => ({
            ...prev,
            [projectId]: {
                ...prev[projectId],
                [permissionKey]: value,
                // Dependency logic: If automating, must be able to view.
                ...(permissionKey === 'automateTestCases' && value && { viewAssignedProjects: true }),
            }
        }));
    };
    
    const handlePresetChange = (projectId: string, presetKey: string) => {
        const preset = permissionPresets[presetKey];
        if (preset) {
            setProjectPermissions(prev => ({
                ...prev,
                [projectId]: preset.permissions,
            }));
        }
    };
    
    const handleSave = () => {
        // In a real app, this would dispatch an action to update the database.
        // Here we'll just show a toast.
        console.log("Saving new role:", user.role);
        console.log("Saving new permissions:", projectPermissions);
        toast({
            title: "Permissions Saved",
            description: `Permissions for ${user.name} have been updated.`,
        });
    };

    const isManager = user.role === 'manager';
    const permissionCategories = useMemo(() => {
        const categories: Record<string, { label: string, perms: (keyof Permissions)[] }> = {
            'Project': { label: 'Project Access', perms: [] },
            'Management': { label: 'Project Management', perms: [] },
            'Admin': { label: 'Global Administration', perms: [] },
        };
        (Object.keys(permissionDescriptions) as (keyof Permissions)[]).forEach(key => {
            const cat = permissionDescriptions[key].category;
            if (categories[cat]) {
                categories[cat].perms.push(key);
            }
        });
        return categories;
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Permissions for {user.name}</CardTitle>
                <CardDescription>Define global and project-specific access levels.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div>
                        <Label htmlFor="role-select">Global Role</Label>
                        <p className="text-xs text-muted-foreground">Sets the baseline permissions across the platform.</p>
                    </div>
                    <Select 
                        value={user.role} 
                        onValueChange={(value: Role) => setUser(prev => ({...prev, role: value as Role}))}
                        disabled={allUsers.filter(u => u.role === 'manager').length === 1 && user.role === 'manager'}
                    >
                        <SelectTrigger id="role-select" className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                 {isManager && (
                    <Alert>
                        <ShieldCheck className="h-4 w-4" />
                        <AlertTitle>Manager Role</AlertTitle>
                        <AlertDescription>
                           Managers have broad permissions, including user and project management. Project-specific overrides can restrict access if needed.
                        </AlertDescription>
                    </Alert>
                )}


                <Separator />

                <div className="space-y-2">
                    <h3 className="font-semibold">Project-Specific Permissions</h3>
                    <p className="text-sm text-muted-foreground">Override global role permissions for individual projects.</p>
                </div>

                <div className="space-y-4">
                    {projects.filter(p => p.members.some(m => m.id === user.id)).map(project => {
                        const effectivePermissions = getEffectivePermissions(user.id, project);
                        const currentProjectPerms = projectPermissions[project.id] || {};
                        const presetKey = Object.keys(permissionPresets).find(key => 
                            JSON.stringify(permissionPresets[key].permissions) === JSON.stringify(currentProjectPerms)
                        ) || 'custom';

                        return (
                            <Card key={project.id} className="bg-muted/30">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{project.name}</CardTitle>
                                        <CardDescription>Owned by {project.owner.name}</CardDescription>
                                    </div>
                                    <Select value={presetKey} onValueChange={key => handlePresetChange(project.id, key)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Role Preset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(permissionPresets).map(([key, preset]) => (
                                                <SelectItem key={key} value={key}>{preset.name}</SelectItem>
                                            ))}
                                            <SelectItem value="custom" disabled>Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Object.entries(permissionCategories).map(([category, { label, perms }]) => (
                                            (isManager || category !== 'Admin') && (
                                                <div key={category} className="space-y-3">
                                                     <h4 className="font-medium text-sm">{label}</h4>
                                                    {perms.map(key => {
                                                        const { label: permLabel, description } = permissionDescriptions[key];
                                                        const isChecked = currentProjectPerms[key] ?? effectivePermissions[key];
                                                        const isDisabled = isManager && permissionPresets.manager.permissions[key] === true;
                                                        
                                                        return (
                                                            <TooltipProvider key={key} delayDuration={100}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Checkbox
                                                                                id={`${project.id}-${user.id}-${key}`}
                                                                                checked={isChecked}
                                                                                disabled={isDisabled}
                                                                                onCheckedChange={(checked) => handlePermissionChange(project.id, key, !!checked)}
                                                                            />
                                                                            <Label htmlFor={`${project.id}-${user.id}-${key}`} className={`text-sm font-normal ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}>
                                                                                {permLabel}
                                                                            </Label>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p className="max-w-xs">{description}</p>
                                                                        {isDisabled && <p className="text-amber-400 mt-2">Managers have this permission by default.</p>}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <Separator />
                
                <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
}
