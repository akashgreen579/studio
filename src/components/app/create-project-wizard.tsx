
"use client";

import { useState, useMemo, useEffect }from "react";
import { useForm, Controller } from "react-hook-form";
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
  FormDescription,
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
import { X, UserPlus, Info, ArrowLeft, FileCode, CheckCircle, Code, Settings, Users, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

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
  template: z.string().default("Standard QA Preset"),
  language: z.enum(["Java", "Python"]).default("Java"),
  buildTool: z.enum(["Maven", "Gradle", "Pip"]).default("Maven"),
  logging: z.enum(["SLF4J", "Log4j2"]).default("SLF4J"),
  reporting: z.enum(["Allure", "Extent"]).default("Allure"),
});

type FrameworkOptions = z.infer<typeof formSchema>;

export function CreateProjectWizard({
  isOpen,
  setIsOpen,
  addProject,
  currentUser,
  existingProjectNames,
}: CreateProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([currentUser]);
  const [permissions, setPermissions] = useState<Record<string, Permissions>>({
    [currentUser.id]: permissionPresets.manager.permissions,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
        name: "",
        description: "",
        template: "Standard QA Preset",
        language: "Java",
        buildTool: "Maven",
        logging: "SLF4J",
        reporting: "Allure"
    },
  });

  const frameworkOptions = form.watch();

  useEffect(() => {
    if(isOpen) {
      form.reset();
      setStep(1);
      setSelectedMembers([currentUser]);
      setPermissions({ [currentUser.id]: permissionPresets.manager.permissions });
    }
  }, [isOpen, currentUser, form]);

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

  const handlePermissionChange = (
    userId: string,
    permissionKey: keyof Permissions,
    value: boolean
  ) => {
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
  
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (existingProjectNames.includes(value.trim())) {
      form.setError("name", {
          type: "manual",
          message: "A project with this name already exists. Please choose a different name."
      })
    } else {
        form.clearErrors("name");
    }
  }

  const handleNextStep = async () => {
    const isValid = await form.trigger(["name", "description"]);
    if (isValid) setStep(2);
  }

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
    setIsOpen(false);
  };
  
  const getBuildFile = (lang: string, tool: string) => {
    if (lang === 'Java') return tool === 'Maven' ? 'pom.xml' : 'build.gradle';
    return 'requirements.txt';
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Customer Portal'" {...field} onBlur={handleNameBlur}/>
                  </FormControl>
                  <FormDescription>Use a clear, unique name.</FormDescription>
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
                    <Textarea placeholder="A brief summary of the project's goals." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Template / Preset</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a preset" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Standard QA Preset">Standard QA Preset</SelectItem>
                        <SelectItem value="Custom" disabled>Custom (coming soon)</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
             />
          </>
        );
      case 2:
        return (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
                <Controller
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Language</FormLabel>
                            <RadioGroup onValueChange={value => {
                                field.onChange(value);
                                if (value === 'Java') form.setValue('buildTool', 'Maven');
                                if (value === 'Python') form.setValue('buildTool', 'Pip');
                            }} value={field.value} className="flex gap-4">
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Java" id="java" /></FormControl>
                                    <Label htmlFor="java">Java</Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="Python" id="python" /></FormControl>
                                    <Label htmlFor="python">Python</Label>
                                </FormItem>
                            </RadioGroup>
                        </FormItem>
                    )}
                />
                <Controller
                    control={form.control}
                    name="buildTool"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Build Tool</FormLabel>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                {frameworkOptions.language === 'Java' ? <>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="Maven" id="maven" /></FormControl>
                                        <Label htmlFor="maven">Maven</Label>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="Gradle" id="gradle" /></FormControl>
                                        <Label htmlFor="gradle">Gradle</Label>
                                    </FormItem>
                                </> : <>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="Pip" id="pip" /></FormControl>
                                        <Label htmlFor="pip">Pip</Label>
                                    </FormItem>
                                </>}
                            </RadioGroup>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="framework"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Framework</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Cucumber">Cucumber</SelectItem></SelectContent>
                            </Select>
                            <FormDescription>More frameworks coming in v2.</FormDescription>
                        </FormItem>
                    )}
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="logging"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logging</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="SLF4J">SLF4J</SelectItem>
                                        <SelectItem value="Log4j2">Log4j2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="reporting"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reporting</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Allure">Allure</SelectItem>
                                        <SelectItem value="Extent">Extent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                 </div>
            </div>
            <div className="col-span-1">
                <Card className="sticky top-20 bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2"><FileCode className="h-5 w-5"/> Framework Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                       <p className="font-semibold">Baseline files to be created:</p>
                       <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> <span>{getBuildFile(frameworkOptions.language, frameworkOptions.buildTool)}</span></li>
                            <li className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> <span>README.md</span></li>
                            <li className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-primary" /> <span>src/... (skeleton)</span></li>
                       </ul>
                       <div className="pt-4 space-y-2">
                            <p className="flex justify-between"><strong>Language:</strong> <span>{frameworkOptions.language}</span></p>
                            <p className="flex justify-between"><strong>Build Tool:</strong> <span>{frameworkOptions.buildTool}</span></p>
                            <p className="flex justify-between"><strong>Logging:</strong> <span>{frameworkOptions.logging}</span></p>
                            <p className="flex justify-between"><strong>Reporting:</strong> <span>{frameworkOptions.reporting}</span></p>
                       </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        );
      case 3:
        return (
            <div className="space-y-6">
                <div className="space-y-4">
                  <FormLabel>Team Members</FormLabel>
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
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
                      <PopoverContent className="w-auto p-0">
                          <ScrollArea className="h-48">
                              {availableUsers.length > 0 ? availableUsers.map(user => (
                                  <div key={user.id} onClick={() => handleMemberSelect(user)} className="p-2 hover:bg-accent cursor-pointer text-sm">
                                      {user.name} <span className="text-muted-foreground">({user.email})</span>
                                  </div>
                              )) : <p className="p-4 text-center text-sm text-muted-foreground">All users added.</p>}
                          </ScrollArea>
                      </PopoverContent>
                  </Popover>
                  {form.formState.errors.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>}
                </div>
                 <div className="space-y-4">
                  <h3 className="font-semibold">Permissions</h3>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                      <div className="space-y-6">
                          {selectedMembers.map(member => (
                              <div key={member.id} className="rounded-lg border bg-card p-4">
                                  <div className="flex items-center justify-between mb-4">
                                      <p className="font-medium">{member.name} {member.id === currentUser.id && "(You)"}</p>
                                      <Select onValueChange={(preset) => {
                                           const newPerms = permissionPresets[preset];
                                           if (newPerms) {
                                               setPermissions(prev => ({...prev, [member.id]: newPerms.permissions}))
                                           }
                                      }} value={Object.keys(permissionPresets).find(key => JSON.stringify(permissionPresets[key].permissions) === JSON.stringify(permissions[member.id]))}>
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
                                      {Object.entries(permissionDescriptions).map(([key, {label, icon: Icon}]) => (
                                          <div key={key} className="flex items-center space-x-2">
                                              <Checkbox 
                                                  id={`${member.id}-${key}`} 
                                                  checked={permissions[member.id]?.[key as keyof Permissions]}
                                                  onCheckedChange={(checked) => handlePermissionChange(member.id, key as keyof Permissions, !!checked)}
                                                  disabled={member.id === currentUser.id && key === 'approveMergePRs'}
                                              />
                                              <div className="grid gap-1.5 leading-none">
                                                  <label htmlFor={`${member.id}-${key}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                                                      <Icon className="h-4 w-4 mr-2" />
                                                      {label}
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
            </div>
        )
      default:
        return null;
    }
  }

  const getStepTitle = () => {
    switch(step) {
        case 1: return "Project Identity";
        case 2: return "Framework Options";
        case 3: return "Team & Permissions";
        default: return "Create New Project";
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            Create New Project
            <div className="flex items-center gap-2">
                {[1,2,3].map(s => (
                     <div key={s} className={`h-2 w-8 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
                ))}
            </div>
          </DialogTitle>
          <DialogDescription>{getStepTitle()}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-1">
             {renderStep()}
            </div>
            
            <DialogFooter>
                {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>}
                <div className="flex-grow"></div>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                {step === 1 && <Button type="button" onClick={handleNextStep}>Next</Button>}
                {step === 2 && <Button type="button" onClick={() => setStep(3)}>Next</Button>}
                {step === 3 && <Button type="submit">Create Project</Button>}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    