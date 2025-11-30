
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Home,
  FileCheck,
  FlaskConical,
  PlayCircle,
  BarChart,
  BrainCircuit,
  Wand,
  Settings,
  Users,
  ScrollText,
  Bell,
  TestTubeDiagonal,
  LogOut,
  UserCheck,
  Palette,
  Bot,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveView } from "@/app/dashboard/page";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { User, Role } from "@/lib/data";
import { Button } from "../ui/button";

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  user: User;
  className?: string;
  activeView: ActiveView;
  onMenuClick: (view: ActiveView) => void;
}

const menuItems = [
  {
    section: "MAIN",
    items: [
      {
        href: "/dashboard",
        icon: Home,
        label: "Dashboard",
        view: "dashboard",
        tooltip: "Overview & insights (Phase 2)",
        roles: ["manager", "employee"],
      },
      {
        href: "/dashboard", // Should go to dashboard then have TMT view selected
        icon: FileCheck,
        label: "TMT View",
        view: "tmt-view",
        tooltip: "Test case selection & filtering (Phase 3)",
        roles: ["manager", "employee"],
      },
      {
        href: "/test-ai-lab",
        icon: FlaskConical,
        label: "TestAI Lab",
        view: "test-ai-lab",
        tooltip: "Automation workspace (Phase 4)",
        roles: ["manager", "employee"],
      },
      {
        href: "/test-ai-lab",
        icon: Link2,
        label: "Keyword Mapping",
        view: "keyword-mapping",
        tooltip: "Keyword mapping workspace (Phase 4)",
        roles: ["manager", "employee"],
      },
      {
        href: "#",
        icon: PlayCircle,
        label: "Execution & Pipelines",
        tooltip: "Run automated test cases (Phase 5)",
        roles: ["manager", "employee"],
      },
      {
        href: "#",
        icon: BarChart,
        label: "Reports",
        tooltip: "Execution reports & historical data (Phase 6)",
        roles: ["manager", "employee"],
      },
      {
        href: "#",
        icon: BrainCircuit,
        label: "AI Insights",
        tooltip: "AI-driven feedback & analysis (Phase 7)",
        roles: ["manager", "employee"],
      },
      {
        href: "#",
        icon: Wand,
        label: "Auto-Healing",
        tooltip: "Automated fix suggestions (Phase 8)",
        roles: ["manager", "employee"],
      },
    ],
  },
  {
    section: "PROJECT MANAGEMENT",
    roles: ["manager"],
    items: [
      {
        href: "/dashboard",
        icon: Settings,
        label: "Project Settings",
        view: "project-settings",
        tooltip: "Framework Scaffold + TMT Integration (Phase 1 & 2)",
        roles: ["manager"],
      },
    ],
  },
  {
    section: "ADMIN",
    roles: ["manager"],
    items: [
      {
        href: "/dashboard",
        icon: Users,
        label: "User Management",
        view: "user-management",
        tooltip: "Role assignment & access levels",
        roles: ["manager"],
      },
      {
        href: "/dashboard",
        icon: ScrollText,
        label: "Audit Log",
        view: "audit-log",
        tooltip: "Track all administrative actions",
        roles: ["manager"],
      },
      {
        href: "/dashboard",
        icon: UserCheck,
        label: "Approvals",
        view: "approvals",
        tooltip: "Manage user access requests",
        roles: ["manager"],
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        href: "/design-system",
        icon: Palette,
        label: "Design System",
        tooltip: "View the component and style guide",
        roles: ["manager", "employee"],
      },
       {
        href: "/test-ai-lab-brief",
        icon: Bot,
        label: "TestAI Lab Brief",
        tooltip: "View the project brief for the TestAI Lab",
        roles: ["manager", "employee"],
      },
      {
        href: "#",
        icon: Bell,
        label: "Notifications",
        tooltip: "View recent notifications",
        roles: ["manager", "employee"],
      },
    ],
  },
];

export function Sidebar({
  currentRole,
  onRoleChange,
  user,
  className,
  activeView,
  onMenuClick,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (item: any) => item.view && item.view === activeView || (item.href && item.href !== '#' && pathname.startsWith(item.href));

  const handleLogout = () => {
    router.push('/login');
  };
  
  const handleLinkClick = (e: React.MouseEvent, item: any) => {
     if (item.view === 'keyword-mapping' && pathname !== '/test-ai-lab') {
        e.preventDefault();
        router.push('/test-ai-lab');
        // This is a bit of a hack to ensure the view is set after navigation
        setTimeout(() => onMenuClick(item.view as ActiveView), 0);
    } else if (item.href === "#" && item.view) {
        e.preventDefault();
        onMenuClick(item.view as ActiveView);
    } else if (item.href === "/dashboard" && item.view) {
        e.preventDefault();
        router.push(item.href);
        // This is a bit of a hack to ensure the view is set after navigation
        setTimeout(() => onMenuClick(item.view as ActiveView), 0);
    } else if (item.href !== "#" && item.href !== pathname) {
        // Standard navigation for other links
        // No e.preventDefault();
    } else if (item.view) {
      e.preventDefault();
      onMenuClick(item.view as ActiveView);
    }
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r bg-background sm:flex",
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/login">
          <TestTubeDiagonal className="h-6 w-6 text-primary" />
          <span className="">TestCraft AI</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          <TooltipProvider>
            {menuItems.map(
              (section) =>
                (section.roles === undefined ||
                  section.roles.includes(currentRole)) && (
                  <div key={section.section} className="py-2">
                    <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                      {section.section}
                    </h3>
                    {section.items.map(
                      (item) =>
                        item.roles.includes(currentRole) && (
                          <Tooltip key={item.label} delayDuration={100}>
                            <TooltipTrigger asChild>
                              <Link
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                  {
                                    "bg-muted text-primary font-semibold":
                                      isActive(item),
                                  }
                                )}
                                href={item.href}
                                onClick={(e) => handleLinkClick(e, item)}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                    )}
                  </div>
                )
            )}
          </TooltipProvider>
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user.avatar}
                alt={user.name}
                data-ai-hint="person face"
              />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}
