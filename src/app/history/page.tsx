"use client";

import { Suspense } from "react";
import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";
import { ExecutionHistoryView } from "@/components/app/execution-history-view";
import { useSearchParams } from 'next/navigation';
import { allUsers } from "@/lib/data";
import type { Role, ActiveView } from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function HistoryPageContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as Role || 'employee';
  const { toast } = useToast();
  const [role, setRole] = useState<Role>(initialRole);
  
  const currentUser = allUsers.find((u) => u.role === role)!;
  
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    const newUser = allUsers.find((u) => u.role === newRole)!;
    toast({
      title: "Switched Role",
      description: `You are now viewing the dashboard as ${newUser.name} (${newRole}).`,
    });
  };

  // For the purpose of this standalone page, we don't need full view switching logic
  // but we need the props for the sidebar to work correctly.
  const handleMenuClick = (view: ActiveView) => {
    // In a real app, this might navigate. Here we can just log it.
    console.log("Navigating to view:", view);
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar
        currentRole={role}
        onRoleChange={handleRoleChange}
        user={currentUser}
        activeView={null} // Or a new specific view type for history
        onMenuClick={handleMenuClick}
      />
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <Header user={currentUser} />
        <main className="flex-1 grid gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <ExecutionHistoryView user={currentUser} />
        </main>
      </div>
    </div>
  );
}


export default function HistoryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HistoryPageContent />
        </Suspense>
    )
}
