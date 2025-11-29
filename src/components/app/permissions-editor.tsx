
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Eye, UserPlus, X } from "lucide-react";
import type { Project, User, Permissions } from "@/lib/data";
import { allUsers, permissionPresets, permissionDescriptions } from "@/lib/data";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface PermissionsEditorProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: Project;
  currentUser: User;
  updateProjectPermissions: (projectId: string, permissions: Record<string, Partial<Permissions>>) => void;
}

export function PermissionsEditor({
  isOpen,
  setIsOpen,
  project,
  currentUser,
  updateProjectPermissions,
}: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Record<string, Partial<Permissions>>>(project.permissions);
  const [members, setMembers] = useState<User[]>(project.members);
  const [previewUser, setPreviewUser] = useState<string>("none");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPermissions(project.permissions);
    setMembers(project.members);
    setPreviewUser("none");
  }, [project, isOpen]);

  const availableUsers = useMemo(
    () => allUsers.filter((u) => !members.some((m) => m.id === u.id)),
    [members]
  );
  
  const handleMemberSelect = (user: User) => {
    setMembers((prev) => [...prev, user]);
    setPermissions((prev) => ({
      ...prev,
      [user.id]: permissionPresets.tester.permissions,
    }));
  };

  const handleMemberRemove = (userId: string) => {
    if (userId === project.owner.id) return;
    setMembers((prev) => prev.filter((m) => m.id !== userId));
    setPermissions((prev) => {
      const newPerms = { ...prev };
      delete newPerms[userId];
      return newPerms;
    });
  };

  const handlePermissionChange = (
    userId: string,
    permissionKey: keyof Permissions,
    value: boolean
  ) => {
    setError(null);
    const ownerCount = members.filter(m => permissions[m.id]?.approveMergePRs).length;
    if (permissionKey === 'approveMergePRs' && ownerCount === 1 && permissions[userId]?.approveMergePRs && !value) {
        setError("At least one owner (with Approve/Merge permission) is required.");
        setTimeout(() => setError(null), 4000);
        return;
    }

    setPermissions((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [permissionKey]: value },
    }));
  };

  const handlePresetChange = (userId: string, presetKey: string) => {
    const preset = permissionPresets[presetKey];
    if (preset) {
      if (userId === currentUser.id) return; // Prevent manager from demoting themselves
      setPermissions((prev) => ({ ...prev, [userId]: preset.permissions }));
    }
  };

  const handleSave = () => {
    // This is a temporary update. In a real app, we'd update the project object.
    const updatedProject = { ...project, members, permissions }; 
    console.log("Updated Project State:", updatedProject)
    
    updateProjectPermissions(project.id, permissions);
    setIsOpen(false);
  };

  const isPreviewing = previewUser !== "none";
  const allPermissionKeys = Object.keys(permissionDescriptions) as (keyof Permissions)[];


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Manage Access for "{project.name}"</DialogTitle>
          <DialogDescription>
            Assign team members and configure their permissions. Changes will be recorded in the audit log.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
            <div className="col-span-1 md:col-span-2 space-y-2">
                <Label>Team Members</Label>
                <div className="rounded-md border p-4 flex flex-wrap gap-3 min-h-[60px] bg-muted/50">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center gap-2 bg-background p-2 rounded-md border">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} data-ai-hint="person face" />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{member.name}</span>
                            {member.id !== project.owner.id && (
                                <button type="button" onClick={() => handleMemberRemove(member.id)} className="ml-1 rounded-full hover:bg-muted p-0.5" disabled={isPreviewing}>
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start" disabled={isPreviewing}>
                            <UserPlus className="mr-2 h-4 w-4" /> Add or find a team member...
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <ScrollArea className="h-48">
                            {availableUsers.length > 0 ? availableUsers.map(user => (
                                <div key={user.id} onClick={() => handleMemberSelect(user)} className="p-2 hover:bg-accent cursor-pointer text-sm flex items-center gap-2">
                                    <Avatar className="h-8 w-8"><AvatarImage src={user.avatar} data-ai-hint="person face" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                    <div>
                                        <div>{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                            )) : <p className="p-4 text-center text-sm text-muted-foreground">All users have been added.</p>}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">User not found? Try a different email or name. If they're new, sync with your organization's directory.</p>
            </div>
            <div className="col-span-1">
                 <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-muted-foreground"/>
                    <Label htmlFor="preview-user">Preview as:</Label>
                </div>
                <Select value={previewUser} onValueChange={setPreviewUser}>
                    <SelectTrigger id="preview-user" className="w-full mt-2">
                        <SelectValue placeholder="Select a user to preview" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Yourself (Manager)</SelectItem>
                        {members.filter(m => m.id !== currentUser.id).map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>


        {isPreviewing && (
            <Alert variant="default" className="mb-4 bg-accent/50">
                <Info className="h-4 w-4" />
                <AlertTitle>Preview Mode</AlertTitle>
                <AlertDescription>
                    You are previewing permissions as: <strong>{members.find(m => m.id === previewUser)?.name}</strong>. UI elements are disabled for editing.
                </AlertDescription>
            </Alert>
        )}

        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

        <ScrollArea className="h-[400px] border rounded-md">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead className="w-[200px]">Team Member</TableHead>
                        {allPermissionKeys.map((key) => {
                            const { label, description } = permissionDescriptions[key];
                            return (
                                <TableHead key={key} className="text-center">
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="flex items-center justify-center gap-1.5 cursor-help">{label} <Info className="h-3 w-3" /></span>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{description}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableHead>
                            )
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium sticky left-0 bg-card">
                                {member.name} {member.id === currentUser.id && "(You)"}
                                <div className="text-xs text-muted-foreground">
                                    <Select 
                                        onValueChange={(preset) => handlePresetChange(member.id, preset)} 
                                        value={Object.keys(permissionPresets).find(key => JSON.stringify(permissionPresets[key].permissions) === JSON.stringify(permissions[member.id])) || 'custom'}
                                        disabled={member.id === currentUser.id || isPreviewing}
                                    >
                                        <SelectTrigger className="h-7 mt-1 text-xs">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(permissionPresets).map(([key, preset]) => (
                                                <SelectItem key={key} value={key}>{preset.name}</SelectItem>
                                            ))}
                                            <SelectItem value="custom" disabled>Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TableCell>
                            {allPermissionKeys.map((permKey) => (
                                <TableCell key={permKey} className="text-center">
                                    <Checkbox
                                        checked={permissions[member.id]?.[permKey]}
                                        onCheckedChange={(checked) => handlePermissionChange(member.id, permKey, !!checked)}
                                        disabled={(member.id === currentUser.id && permKey === 'approveMergePRs') || isPreviewing}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPreviewing}>Save & Audit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
