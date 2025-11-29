
"use client";

import { useState, useMemo } from "react";
import { allUsers, projects, permissionPresets, getEffectivePermissions, permissionDescriptions } from "@/lib/data";
import type { User, Project, Permissions } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User as UserIcon, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserPermissionsEditor } from "./user-permissions-editor";

export function UserManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(allUsers.find(u => u.role === 'manager') || null);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Select a user to view and manage their permissions.</CardDescription>
                    <div className="relative pt-2">
                        <Search className="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..." 
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col">
                        {filteredUsers.map(user => (
                            <button 
                                key={user.id}
                                className={`flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors ${selectedUser?.id === user.id ? 'bg-muted' : ''}`}
                                onClick={() => setSelectedUser(user)}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.avatar} data-ai-hint="person face" />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Badge variant={user.role === 'manager' ? 'default' : 'secondary'}>{user.role}</Badge>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div>
                {selectedUser ? (
                    <UserPermissionsEditor 
                        key={selectedUser.id}
                        user={selectedUser} 
                        projects={projects}
                    />
                ) : (
                    <Card className="flex items-center justify-center h-96 border-dashed">
                        <div className="text-center">
                            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">Select a User</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose a user from the list to see their detailed permissions.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
