
"use client";

import { useState } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, Role } from "@/lib/data";

interface AddUserModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAddUser: (user: Omit<User, 'id' | 'avatar'>) => void;
  managers: User[];
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(["manager", "employee"]),
  managerId: z.string().optional(),
}).refine(data => data.role === 'employee' ? !!data.managerId : true, {
    message: "An employee must be assigned to a manager.",
    path: ["managerId"],
});


export function AddUserModal({ isOpen, setIsOpen, onAddUser, managers }: AddUserModalProps) {
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "employee",
    },
  });
  
  const role = form.watch("role");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onAddUser(values as Omit<User, 'id' | 'avatar'>);
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the user's details and assign them a role and position in the hierarchy.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="name@company.com" {...field} />
                        </FormControl>
                         <FormDescription>Used for login and notifications.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>Global Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>Sets baseline platform permissions.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {role === 'employee' && (
                    <FormField
                        control={form.control}
                        name="managerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign Under (Manager)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a manager" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {managers.map(manager => (
                                             <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Determines the reporting line for this employee.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit">Add User</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
