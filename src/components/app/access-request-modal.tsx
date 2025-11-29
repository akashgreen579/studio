
"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Permissions, Project, User } from "@/lib/data";
import { permissionDescriptions } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";


interface AccessRequestModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
  project: Project;
}

export function AccessRequestModal({ isOpen, setIsOpen, user, project }: AccessRequestModalProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<Array<keyof Permissions>>([]);
    const [justification, setJustification] = useState("");
    const { toast } = useToast();

    const handlePermissionToggle = (permission: keyof Permissions, checked: boolean) => {
        setSelectedPermissions(prev => 
            checked ? [...prev, permission] : prev.filter(p => p !== permission)
        );
    }
    
    const handleSubmit = () => {
        // In a real app, this would dispatch to a state management solution or API
        console.log({
            userId: user.id,
            projectId: project.id,
            requestedPermissions: selectedPermissions,
            justification
        });
        toast({
            title: "Access Request Submitted",
            description: "Your manager has been notified and will review your request shortly."
        });
        setIsOpen(false);
        setSelectedPermissions([]);
        setJustification("");
    }

    const allPermissionKeys = Object.keys(permissionDescriptions) as (keyof Permissions)[];


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Request Additional Access</DialogTitle>
                    <DialogDescription>
                        Select the permissions you need for the "{project.name}" project and provide a reason for your request.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Permissions to Request</Label>
                        <ScrollArea className="h-48 rounded-md border p-4">
                            <div className="space-y-3">
                            {allPermissionKeys.map(key => {
                                const { label, description } = permissionDescriptions[key];
                                // This is a simplified example. A real app would check if user *already* has the perm.
                                return (
                                <div key={key} className="flex items-start space-x-3">
                                    <Checkbox 
                                        id={`req-${key}`} 
                                        onCheckedChange={(checked) => handlePermissionToggle(key, !!checked)}
                                        checked={selectedPermissions.includes(key)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label htmlFor={`req-${key}`} className="font-medium cursor-pointer">{label}</Label>
                                        <p className="text-xs text-muted-foreground">{description}</p>
                                    </div>
                                </div>
                                )
                            })}
                            </div>
                        </ScrollArea>
                    </div>

                    {selectedPermissions.includes("approveMergePRs") && (
                        <Alert variant="default" className="bg-amber-50 border-amber-200">
                            <Info className="h-4 w-4 !text-amber-600"/>
                            <AlertTitle className="text-amber-800">Dependency Check</AlertTitle>
                            <AlertDescription className="text-amber-700">
                                Requesting "Approve/Merge PRs" requires "Automate Tests" and "Commit & Publish". Ensure you have these, or request them as well.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="justification">Justification (Required)</Label>
                        <Textarea
                            id="justification"
                            placeholder="e.g., I need to be able to merge hotfixes for the upcoming release."
                            value={justification}
                            onChange={e => setJustification(e.target.value)}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">{justification.length} / 500</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={selectedPermissions.length === 0 || justification.trim() === ""}>Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
