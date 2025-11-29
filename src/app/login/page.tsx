
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTubeDiagonal, ShieldCheck, User } from "lucide-react";
import type { Role } from "@/app/dashboard/page";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: Role) => {
    router.push(`/dashboard?role=${role}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-8">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-6 items-center gap-2">
            <TestTubeDiagonal className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">TestCraft AI</h1>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Login</CardTitle>
            <CardDescription>Select your role to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => handleLogin("manager")}
              className="w-full"
              size="lg"
            >
              <ShieldCheck className="mr-2 h-5 w-5" />
              Login as Manager
            </Button>
            <Button
              onClick={() => handleLogin("employee")}
              className="w-full"
              variant="secondary"
              size="lg"
            >
              <User className="mr-2 h-5 w-5" />
              Login as Employee
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
