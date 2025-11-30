
"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/app/header";
import { Sidebar } from "@/components/app/sidebar";
import { allUsers } from "@/lib/data";
import type { Role, ActiveView, User } from "@/lib/data";
import { NlpCleanupView } from "@/components/app/test-ai-lab/nlp-cleanup-view";
import { GherkinPreparationView } from "@/components/app/test-ai-lab/gherkin-preparation-view";
import { AnimatePresence, motion } from "framer-motion";

export type LabStage = "nlp-cleanup" | "gherkin-preparation";

const testCase = {
  id: "TC-101",
  summary: "Verify user can log in with valid credentials",
  originalSteps: [
    "User goes to the login page.",
    "User enters their username and password.",
    "User clicks the login button.",
    "The user should be redirected to the dashboard.",
    "A welcome message is visible.",
  ],
};

const cleanedStepsInitial = [
  {
    original: "User goes to the login page.",
    cleaned: "Given the user is on the login page",
    confidence: 95,
    suggestion: "Change to Gherkin 'Given' syntax",
    type: "syntax",
  },
  {
    original: "User enters their username and password.",
    cleaned: "When the user enters their username and password",
    confidence: 98,
    suggestion: "Change to Gherkin 'When' syntax",
    type: "syntax",
  },
  {
    original: "User clicks the login button.",
    cleaned: "And the user clicks the 'Login' button",
    confidence: 85,
    suggestion: "Specify UI element 'Login' button",
    type: "clarity",
  },
  {
    original: "The user should be redirected to the dashboard.",
    cleaned: "Then the user is redirected to the dashboard page",
    confidence: 92,
    suggestion: "Change to Gherkin 'Then' syntax",
    type: "syntax",
  },
  {
    original: "A welcome message is visible.",
    cleaned: "And a 'Welcome' message is displayed",
    confidence: 78,
    suggestion: "Clarify what is displayed",
    type: "clarity",
  },
];

export default function TestAiLabPage() {
  const [activeView, setActiveView] = useState<ActiveView>("tmt-view");
  const [currentRole, setCurrentRole] = useState<Role>("manager");
  const [labStage, setLabStage] = useState<LabStage>("nlp-cleanup");

  const [cleanedSteps, setCleanedSteps] = useState(cleanedStepsInitial);

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.role === currentRole)!;
  }, [currentRole]);

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    // In a real app, you might want to reset the view or redirect
    setActiveView("dashboard"); 
  };

  const handleMenuClick = (view: ActiveView) => {
    setActiveView(view);
  };
  
  const handleNlpComplete = (finalSteps: typeof cleanedStepsInitial) => {
    setCleanedSteps(finalSteps);
    setLabStage("gherkin-preparation");
  }

  const renderLabStage = () => {
    switch (labStage) {
      case "nlp-cleanup":
        return (
          <NlpCleanupView
            testCase={testCase}
            initialCleanedSteps={cleanedSteps}
            onComplete={handleNlpComplete}
          />
        );
      case "gherkin-preparation":
        return (
           <GherkinPreparationView 
              testCase={testCase}
              steps={cleanedSteps.map(s => s.cleaned)}
           />
        );
      default:
        return <div>Unknown stage</div>;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        user={currentUser}
        activeView={"test-ai-lab"}
        onMenuClick={handleMenuClick}
      />
      <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <main className="flex-1 grid gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={labStage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderLabStage()}
                </motion.div>
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
