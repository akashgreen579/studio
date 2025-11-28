"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { allUsers, permissionPresets, permissionDescriptions } from "@/lib/data";
import type { User, Project, Permissions } from "@/lib/data";
import { X, UserPlus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface CreateProjectWizardProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addProject: (project: Omit<Project, "id" | "owner" | "lastUpdated">) => void;
  currentUser: User;
  existingProjectNames: string[];
}

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

export function CreateProjectWizard({
  isOpen,
  setIsOpen,
  addProject,
  currentUser,
  existingProjectNames,
}: CreateProjectWizardProps) {
  const [selectedMembers, setSelectedMembers] = useState<User[]>([currentUser]);
  const [permissions, setPermissions] = useState<Record<string, Permissions>>({
    [currentUser.id]: permissionPresets.manager.permissions,
  });
  const [nameWarning, setNameWarning] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  const availableUsers = useMemo(
    () => allUsers.filter((u) => !selectedMembers.some((m) => m.id === u.id)),
    [selectedMembers]
  );

  const handleMemberSelect = (user: User) => {
    setSelectedMembers((prev) => [...prev, user]);
    setPermissions((prev) => ({
      ...prev,
      [user.id]: permissionPresets.tester.permissions,
    }));
  };

  const handleMemberRemove = (userId: string) => {
    if (userId === currentUser.id) return;
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
    setPermissions((prev) => {
      const newPerms = { ...prev };
      delete newPerms[userId];
      return newPerms;
    });
  };

  const handlePresetChange = (userId: string, presetKey: string) => {
    const preset = permissionPresets[presetKey];
    if (preset) {
      setPermissions((prev) => ({ ...prev, [userId]: preset.permissions }));
    }
  };

  const handlePermissionChange = (
    userId: string,
    permissionKey: keyof Permissions,
    value: boolean
  ) => {
    // Ensure at least one owner
    const isLastOwner = selectedMembers.filter(m => permissions[m.id]?.approveMergePRs).length === 1;
    if (permissionKey === 'approveMergePRs' && isLastOwner && permissions[userId]?.approveMergePRs && !value) {
        form.setError("root", { type: "custom", message: "At least one project owner (with Approve/Merge permission) is required." });
        setTimeout(() => form.clearErrors("root"), 3000);
        return;
    }
    setPermissions((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [permissionKey]: value },
    }));
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("name", value);
    if (existingProjectNames.includes(value.trim())) {
      setNameWarning("A project with this name already exists. Please choose a different name.");
    } else {
      setNameWarning(null);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if(selectedMembers.length === 0) {
      form.setError("root", { type: "custom", message: "Please add at least one team member." });
      return;
    }
    
    addProject({
      name: values.name,
      description: values.description || "",
      members: selectedMembers,
      permissions: permissions,
    });
    form.reset();
    setSelectedMembers([currentUser]);
    setPermissions({ [currentUser.id]: permissionPresets.manager.permissions });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to set up your new testing project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Customer Portal'" {...field} onChange={handleNameChange} />
                      </FormControl>
                      {nameWarning && <p className="text-sm font-medium text-yellow-600">{nameWarning}</p>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief summary of the project's goals."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormLabel>Team Members</FormLabel>
                <div className="flex flex-wrap gap-2">
                    {selectedMembers.map(member => (
                        <Badge key={member.id} variant="secondary" className="pl-2 pr-1 py-1 text-sm">
                            {member.name}
                            {member.id !== currentUser.id && (
                                <button type="button" onClick={() => handleMemberRemove(member.id)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </Badge>
                    ))}
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start">
                            <UserPlus className="mr-2 h-4 w-4" /> Add Team Members
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                        <ScrollArea className="h-48">
                            {availableUsers.length > 0 ? availableUsers.map(user => (
                                <div key={user.id} onClick={() => handleMemberSelect(user)} className="p-2 hover:bg-accent cursor-pointer text-sm">
                                    {user.name} <span className="text-muted-foreground">({user.email})</span>
                                </div>
                            )) : <p className="p-4 text-center text-sm text-muted-foreground">All users added.</p>}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold">Permissions</h3>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-6">
                        {selectedMembers.map(member => (
                            <div key={member.id} className="rounded-lg border bg-card p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="font-medium">{member.name} {member.id === currentUser.id && "(You)"}</p>
                                    <Select onValueChange={(preset) => handlePresetChange(member.id, preset)} defaultValue={Object.keys(permissionPresets).find(key => JSON.stringify(permissionPresets[key].permissions) === JSON.stringify(permissions[member.id]))}>
                                        <SelectTrigger className="w-[180px]" disabled={member.id === currentUser.id}>
                                            <SelectValue placeholder="Select a preset..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(permissionPresets).map(([key, preset]) => (
                                                <SelectItem key={key} value={key}>{preset.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(permissionDescriptions).map(([key, {label, description}]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`${member.id}-${key}`} 
                                                checked={permissions[member.id]?.[key as keyof Permissions]}
                                                onCheckedChange={(checked) => handlePermissionChange(member.id, key as keyof Permissions, !!checked)}
                                                disabled={member.id === currentUser.id && key === 'approveMergePRs'}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label htmlFor={`${member.id}-${key}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                                                    {label}
                                                    <TooltipProvider delayDuration={100}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild><Info className="h-3 w-3 ml-1.5 text-muted-foreground" /></TooltipTrigger>
                                                            <TooltipContent><p>{description}</p></TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            
            {form.formState.errors.root && <FormMessage>{form.formState.errors.root.message}</FormMessage>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!!nameWarning}>Create Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
