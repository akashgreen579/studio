
"use client";

import { useState, useMemo, useEffect } from "react";
import type { User, Project, Permissions, Role } from "@/lib/data";
import { permissionPresets, getEffectivePermissions, permissionDescriptions, allUsers } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "../ui/switch";

interface UserPermissionsEditorProps {
    user: User;
    projects: Project[];
}

export function UserPermissionsEditor({ user: initialUser, projects }: UserPermissionsEditorProps) {
    const [user, setUser] = useState<User>(initialUser);
    const [projectPermissions, setProjectPermissions] = useState<Record<string, Partial<Permissions>>>(() => {
        const perms: Record<string, Partial<Permissions>> = {};
        projects.forEach(p => {
            if (p.permissions[user.id]) {
                perms[p.id] = p.permissions[user.id];
            } else if (p.members.some(m => m.id === user.id)) {
                perms[p.id] = {}; // User is a member but has no specific overrides
            }
        });
        return perms;
    });
    const [previewAsEmployee, setPreviewAsEmployee] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        setUser(initialUser);
        const perms: Record<string, Partial<Permissions>> = {};
        projects.forEach(p => {
            if (p.permissions[initialUser.id]) {
                perms[p.id] = p.permissions[initialUser.id];
            } else if (p.members.some(m => m.id === initialUser.id)) {
                perms[p.id] = {};
            }
        });
        setProjectPermissions(perms);
        setPreviewAsEmployee(false);
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
        console.log("Saving new role:", user.role);
        console.log("Saving new permissions:", projectPermissions);
        toast({
            title: "Permissions Saved",
            description: `Permissions for ${user.name} have been updated.`,
        });
    };
    
    const handleRevert = () => {
        setUser(initialUser);
        const perms: Record<string, Partial<Permissions>> = {};
        projects.forEach(p => {
            if (p.permissions[initialUser.id]) {
                perms[p.id] = p.permissions[initialUser.id];
            }
        });
        setProjectPermissions(perms);
        toast({
            title: "Changes Reverted",
            description: `Permissions for ${user.name} have been reset to their last saved state.`,
        });
    }

    const isManager = user.role === 'manager';

    const permissionCategories = useMemo(() => {
        const categories: Record<string, { label: string; perms: (keyof Permissions)[] }> = {
            'Project': { label: 'Project Access', perms: ['viewAssignedProjects', 'automateTestCases', 'createSrcStructure', 'runPipelines', 'commitAndPublish'] },
            'Management': { label: 'Project Management', perms: ['createProject', 'editProjectSettings', 'assignUsers', 'syncTMT', 'approveMergePRs'] },
            'Admin': { label: 'Global Administration', perms: ['approveAccessRequests', 'adminOverride'] },
        };
        return categories;
    }, []);

    const userIsManager = user.role === 'manager';

    if (previewAsEmployee) {
        return (
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Permissions for {user.name}</CardTitle>
                            <CardDescription>Read-only view of permissions for an employee.</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="preview-toggle">Preview as Employee</Label>
                            <Switch id="preview-toggle" checked={previewAsEmployee} onCheckedChange={setPreviewAsEmployee} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Alert variant="default" className="bg-muted/50 mb-6">
                        <Eye className="h-4 w-4" />
                        <AlertTitle>Read-Only Employee View</AlertTitle>
                        <AlertDescription>
                           This is how {user.name} sees their permissions. To make changes, toggle off the preview.
                           <div className="mt-4">
                               <Button variant="outline">Request Access</Button>
                           </div>
                        </AlertDescription>
                    </Alert>
                     {projects.filter(p => p.members.some(m => m.id === user.id)).map(project => (
                         <Card key={project.id} className="bg-muted/30 mb-4">
                            <CardHeader>
                                <CardTitle className="text-lg">{project.name}</CardTitle>
                                <CardDescription>Owned by {project.owner.name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">You have read-only access. Contact your manager to request changes.</p>
                            </CardContent>
                         </Card>
                     ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Permissions for {user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="preview-toggle">Preview as Employee</Label>
                        <Switch id="preview-toggle" checked={previewAsEmployee} onCheckedChange={setPreviewAsEmployee} />
                    </div>
                </div>
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

                <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                    {projects.filter(p => p.members.some(m => m.id === user.id)).map(project => {
                        const effectivePermissions = getEffectivePermissions(user.id, project);
                        const currentProjectPerms = projectPermissions[project.id] || {};
                        const presetKey = Object.keys(permissionPresets).find(key => 
                            JSON.stringify(permissionPresets[key].permissions) === JSON.stringify(currentProjectPerms)
                        ) || 'custom';

                        return (
                            <Card key={project.id} className="bg-card">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{project.name}</CardTitle>
                                        <CardDescription>Owned by {project.owner.name}</CardDescription>
                                    </div>
                                    <Select value={presetKey} onValueChange={key => handlePresetChange(project.id, key)} disabled={userIsManager}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Role Preset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(permissionPresets).map(([key, preset]) => (
                                                <SelectItem key={key} value={key} disabled={key === 'manager'}>{preset.name}</SelectItem>
                                            ))}
                                            <SelectItem value="custom" disabled>Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        {Object.entries(permissionCategories).map(([category, { label, perms }]) => (
                                            (userIsManager || category !== 'Admin') && (
                                                <div key={category} className="space-y-3">
                                                     <h4 className="font-medium text-sm">{label}</h4>
                                                    {perms.map(key => {
                                                        const { label: permLabel, description } = permissionDescriptions[key];
                                                        const isChecked = currentProjectPerms[key] ?? effectivePermissions[key];
                                                        const isDisabled = userIsManager && permissionPresets.manager.permissions[key] === true;
                                                        
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
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4 border-t">
                <Button variant="link" className="text-muted-foreground p-0 h-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Export User Permissions (CSV)
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRevert}>Revert</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </CardFooter>
        </Card>
    );
}
