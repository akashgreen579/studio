
"use client";

import { useState, useMemo } from "react";
import { allUsers } from "@/lib/data";
import type { User } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, ChevronDown, ChevronRight, User as UserIcon, AlertTriangle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AddUserModal } from "./add-user-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";


export function HierarchyManagement() {
    const [users, setUsers] = useState<User[]>(allUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedManager, setSelectedManager] = useState<User | null>(allUsers.find(u => u.role === 'manager') || null);
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [collapsedRoles, setCollapsedRoles] = useState<string[]>([]);
    
    const managers = useMemo(() => users.filter(u => u.role === 'manager'), [users]);
    // A simple mock of hierarchy: employees are under the first manager.
    const employeesByManager = useMemo(() => {
        const mapping: Record<string, User[]> = {};
        managers.forEach(m => mapping[m.id] = []);
        users.forEach(u => {
            if (u.role === 'employee' && managers.length > 0) {
                 mapping[managers[0].id].push(u);
            }
        });
        return mapping;
    }, [users, managers]);


    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, users]);

    const handleAddUser = (newUser: Omit<User, 'id' | 'avatar'>) => {
        const user: User = {
            ...newUser,
            id: `user-${Date.now()}`,
            avatar: `https://i.pravatar.cc/150?u=${newUser.email}`
        };
        setUsers(prev => [...prev, user]);
    }
    
    const handleRemoveEmployee = (employeeId: string, managerId: string) => {
        // This is a mock. In a real app, you'd update the employee's managerId.
        console.log(`Removing employee ${employeeId} from manager ${managerId}`);
        setUsers(prev => prev.filter(u => u.id !== employeeId));
    }
    
    const toggleRoleCollapse = (role: string) => {
        setCollapsedRoles(prev => 
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    }
    
    const UserCard = ({ user }: { user: User }) => (
        <div
            className={`flex items-center gap-4 p-2 text-left hover:bg-muted/50 transition-colors w-full rounded-md cursor-pointer ${selectedManager?.id === user.id ? 'bg-muted' : ''}`}
            onClick={() => user.role === 'manager' && setSelectedManager(user)}
        >
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} data-ai-hint="person face" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
                <p className="font-semibold truncate text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Badge variant={user.role === 'manager' ? 'default' : 'secondary'} className="capitalize text-xs">{user.role}</Badge>
            <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Active</span>
            </div>
        </div>
    );
    
    const RoleGroup = ({ role, usersInRole }: { role: string, usersInRole: User[] }) => {
        const isCollapsed = collapsedRoles.includes(role);
        return (
            <div>
                <button className="flex items-center w-full text-left py-2" onClick={() => toggleRoleCollapse(role)}>
                    {isCollapsed ? <ChevronRight className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    <h3 className="font-semibold uppercase text-sm text-muted-foreground tracking-wider">{role} ({usersInRole.length})</h3>
                </button>
                {!isCollapsed && (
                    <div className="pl-6 space-y-1 mt-1">
                        {usersInRole.map(user => <UserCard key={user.id} user={user}/>)}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Hierarchy</h2>
                 <Button onClick={() => setAddUserModalOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add New User
                </Button>
            </div>
            <p className="text-muted-foreground mb-4 text-sm">All hierarchy changes are logged automatically in the Audit Log.</p>
            
            <div className="grid md:grid-cols-[350px_1fr] gap-8 items-start">
                <Card>
                    <CardHeader>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Filter by name or email..." 
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                        <RoleGroup role="Managers" usersInRole={managers.filter(u => filteredUsers.includes(u))} />
                        <RoleGroup role="Employees" usersInRole={users.filter(u => u.role === 'employee' && filteredUsers.includes(u))} />
                    </CardContent>
                </Card>

                <div>
                    {selectedManager ? (
                        <Card>
                             <CardHeader>
                                <CardTitle>Manager: {selectedManager.name}'s Team</CardTitle>
                                <CardDescription>Direct reports assigned to this manager.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                     {employeesByManager[selectedManager.id]?.length > 0 ? employeesByManager[selectedManager.id].map(employee => (
                                         <div key={employee.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                            <div className="flex items-center gap-4">
                                                 <Avatar className="h-10 w-10">
                                                    <AvatarImage src={employee.avatar} data-ai-hint="person face" />
                                                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{employee.name}</p>
                                                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                                                </div>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                <Tooltip>
                                                <TooltipTrigger asChild>
                                                 <Button variant="outline" size="sm">Reassign</Button>
                                                 </TooltipTrigger>
                                                  <TooltipContent><p>Admin Only</p></TooltipContent>
                                                 </Tooltip>
                                                 </TooltipProvider>

                                                <AlertDialog>
                                                  <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">Remove</Button>
                                                  </AlertDialogTrigger>
                                                  <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                      <AlertDialogDescription>
                                                        Removing {employee.name} from this team will revoke their project access under this manager. This action cannot be undone.
                                                      </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                      <AlertDialogAction onClick={() => handleRemoveEmployee(employee.id, selectedManager.id)}>Confirm</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                  </AlertDialogContent>
                                                </AlertDialog>
                                             </div>
                                         </div>
                                     )) : (
                                        <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
                                            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-medium">No Direct Reports</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                               This manager does not have any employees assigned to them.
                                            </p>
                                        </div>
                                     )}
                                </div>
                            </CardContent>
                             <CardFooter className="bg-muted/50 p-4 border-t text-sm text-muted-foreground">
                                <AlertTriangle className="h-4 w-4 mr-2"/> Reassigning or removing employees is an administrative action.
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="flex items-center justify-center h-96 border-dashed">
                            <div className="text-center">
                                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">Select a Manager</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Choose a manager from the hierarchy to view their team details.
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            <AddUserModal 
                isOpen={isAddUserModalOpen} 
                setIsOpen={setAddUserModalOpen}
                onAddUser={handleAddUser}
                managers={managers}
            />
        </>
    );
}
