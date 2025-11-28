"use client";

import { useState, useEffect } from "react";
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
import { Info, Eye } from "lucide-react";
import type { Project, User, Permissions } from "@/lib/data";
import { permissionPresets, permissionDescriptions } from "@/lib/data";
import { Label } from "../ui/label";

interface PermissionsEditorProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  project: Project;
  currentUser: User;
  updateProjectPermissions: (projectId: string, permissions: Record<string, Permissions>) => void;
}

export function PermissionsEditor({
  isOpen,
  setIsOpen,
  project,
  currentUser,
  updateProjectPermissions,
}: PermissionsEditorProps) {
  const [permissions, setPermissions] = useState<Record<string, Permissions>>(project.permissions);
  const [previewUser, setPreviewUser] = useState<string>("none");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPermissions(project.permissions);
    setPreviewUser("none");
  }, [project, isOpen]);

  const handlePermissionChange = (
    userId: string,
    permissionKey: keyof Permissions,
    value: boolean
  ) => {
    setError(null);
    const ownerCount = project.members.filter(m => permissions[m.id]?.approveMergePRs).length;
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
    updateProjectPermissions(project.id, permissions);
    setIsOpen(false);
  };

  const isPreviewing = previewUser !== "none";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Permissions for "{project.name}"</DialogTitle>
          <DialogDescription>
            Manage team member access and roles. Changes will be recorded in the audit log.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 my-4">
            <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground"/>
                <Label htmlFor="preview-user">Preview as:</Label>
            </div>
            <Select value={previewUser} onValueChange={setPreviewUser}>
                <SelectTrigger id="preview-user" className="w-[250px]">
                    <SelectValue placeholder="Select a user to preview" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Yourself (Manager)</SelectItem>
                    {project.members.filter(m => m.id !== currentUser.id).map(member => (
                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {isPreviewing && (
            <Alert variant="default" className="mb-4 bg-accent/50">
                <Info className="h-4 w-4" />
                <AlertTitle>Preview Mode</AlertTitle>
                <AlertDescription>
                    You are previewing permissions as: <strong>{project.members.find(m => m.id === previewUser)?.name}</strong>. UI elements are disabled.
                </AlertDescription>
            </Alert>
        )}

        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

        <ScrollArea className="h-[400px] border rounded-md">
            <Table>
                <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                        <TableHead className="w-[200px]">Team Member</TableHead>
                        {Object.entries(permissionDescriptions).map(([key, { label, description }]) => (
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
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {project.members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">
                                {member.name} {member.id === currentUser.id && "(You)"}
                                <div className="text-xs text-muted-foreground">
                                    <Select 
                                        onValueChange={(preset) => handlePresetChange(member.id, preset)} 
                                        defaultValue={Object.keys(permissionPresets).find(key => JSON.stringify(permissionPresets[key].permissions) === JSON.stringify(permissions[member.id]))}
                                        disabled={member.id === currentUser.id || isPreviewing}
                                    >
                                        <SelectTrigger className="h-7 mt-1 text-xs">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(permissionPresets).map(([key, preset]) => (
                                                <SelectItem key={key} value={key}>{preset.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TableCell>
                            {Object.keys(permissionDescriptions).map((key) => {
                                const permKey = key as keyof Permissions;
                                return (
                                    <TableCell key={key} className="text-center">
                                        <Checkbox
                                            checked={permissions[member.id]?.[permKey]}
                                            onCheckedChange={(checked) => handlePermissionChange(member.id, permKey, !!checked)}
                                            disabled={(member.id === currentUser.id && permKey === 'approveMergePRs') || isPreviewing}
                                        />
                                    </TableCell>
                                );
                            })}
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
