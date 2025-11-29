
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPermissionsView } from "./user-permissions-view";
import { HierarchyManagement } from "./hierarchy-management";
import { Users, Workflow } from "lucide-react";

export function UserManagement() {
    const [activeTab, setActiveTab] = useState("permissions");
    
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="permissions">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="permissions">
                    <Users className="mr-2 h-4 w-4" />
                    Permissions View
                </TabsTrigger>
                <TabsTrigger value="hierarchy">
                    <Workflow className="mr-2 h-4 w-4" />
                    Hierarchy View
                </TabsTrigger>
            </TabsList>
            <TabsContent value="permissions" className="mt-4">
                <UserPermissionsView />
            </TabsContent>
            <TabsContent value="hierarchy" className="mt-4">
                <HierarchyManagement />
            </TabsContent>
        </Tabs>
    );
}
