import { PlaceHolderImages } from './placeholder-images';
import { Eye, TestTube, FolderPlus, GitMerge, PlayCircle, type LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

// Types
export type Role = "manager" | "employee" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

export interface Permissions {
  viewAssignedProjects: boolean;
  automateTestCases: boolean;
  createSrcStructure: boolean;
  approveMergePRs: boolean;
  runPipelines: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: User;
  members: User[];
  permissions: Record<string, Permissions>; // key is userId
  lastUpdated: Date;
}

export interface AuditLogEntry {
  id: string;
  user: User;
  action: string;
  details: string;
  timestamp: Date;
  impact: "Low" | "Medium" | "High";
}

export const permissionDescriptions: Record<keyof Permissions, { label: string; description: string; badge: string, icon: LucideIcon }> = {
    viewAssignedProjects: { label: "View", description: "Can see projects they are assigned to in their dashboard.", badge: "View", icon: Eye },
    automateTestCases: { label: "Automate", description: "Allows user to write and commit new test automation scripts.", badge: "Automate", icon: TestTube },
    createSrcStructure: { label: "Structure", description: "Allows user to create new folders under the framework when automating tests.", badge: "Structure", icon: FolderPlus },
    approveMergePRs: { label: "Approve/Merge", description: "Grants permissions to approve and merge pull requests to the main branch.", badge: "Approve", icon: GitMerge },
    runPipelines: { label: "Run Tests", description: "Enables user to trigger CI/CD test execution pipelines.", badge: "Run Tests", icon: PlayCircle },
};


// Mock Data
const managerAvatar = PlaceHolderImages.find(p => p.id === 'manager-avatar')?.imageUrl || '';
const employeeAvatar = PlaceHolderImages.find(p => p.id === 'employee-avatar')?.imageUrl || '';
const user1Avatar = PlaceHolderImages.find(p => p.id === 'user1-avatar')?.imageUrl || '';
const user2Avatar = PlaceHolderImages.find(p => p.id === 'user2-avatar')?.imageUrl || '';
const user3Avatar = PlaceHolderImages.find(p => p.id === 'user3-avatar')?.imageUrl || '';


export const allUsers: User[] = [
    { id: "user-manager", name: "Alex Hartman", email: "alex.hartman@example.com", avatar: managerAvatar, role: "manager" },
    { id: "user-employee", name: "Samira Khan", email: "samira.khan@example.com", avatar: employeeAvatar, role: "employee" },
    { id: "user-1", name: "John Doe", email: "john.doe@example.com", avatar: user1Avatar, role: "employee" },
    { id: "user-2", name: "Jane Smith", email: "jane.smith@example.com", avatar: user2Avatar, role: "employee" },
    { id: "user-3", name: "Peter Jones", email: "peter.jones@example.com", avatar: user3Avatar, role: "employee" },
];

export const users = {
    manager: allUsers.find(u => u.role === 'manager')!,
    employee: allUsers.find(u => u.role === 'employee')!,
};

const defaultPermissions: Record<string, Permissions> = {
    "user-manager": { viewAssignedProjects: true, automateTestCases: true, createSrcStructure: true, approveMergePRs: true, runPipelines: true },
    "user-employee": { viewAssignedProjects: true, automateTestCases: true, createSrcStructure: false, approveMergePRs: false, runPipelines: true },
};

export const permissionPresets: Record<string, {name: string, permissions: Permissions}> = {
    manager: {
        name: "Manager",
        permissions: { viewAssignedProjects: true, automateTestCases: true, createSrcStructure: true, approveMergePRs: true, runPipelines: true }
    },
    senior_qa: {
        name: "Senior QA",
        permissions: { viewAssignedProjects: true, automateTestCases: true, createSrcStructure: true, approveMergePRs: false, runPipelines: true }
    },
    tester: {
        name: "Tester",
        permissions: { viewAssignedProjects: true, automateTestCases: true, createSrcStructure: false, approveMergePRs: false, runPipelines: true }
    },
    viewer: {
        name: "Viewer",
        permissions: { viewAssignedProjects: true, automateTestCases: false, createSrcStructure: false, approveMergePRs: false, runPipelines: false }
    }
}

export const projects: Project[] = [
  {
    id: "proj1",
    name: "Customer Portal Relaunch",
    description: "End-to-end testing for the new customer portal, focusing on user authentication, account management, and order history.",
    owner: users.manager,
    members: [users.manager, users.employee, allUsers[3]],
    permissions: {...defaultPermissions, "user-2": permissionPresets.senior_qa.permissions },
    lastUpdated: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: "proj2",
    name: "Payment Gateway Integration",
    description: "API and integration testing for the new payment provider. Ensures secure and reliable transaction processing.",
    owner: users.manager,
    members: [users.manager, users.employee, allUsers[2], allUsers[4]],
    permissions: {
        ...defaultPermissions,
        "user-1": permissionPresets.tester.permissions,
        "user-3": permissionPresets.viewer.permissions
    },
    lastUpdated: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
];

export const auditLog: AuditLogEntry[] = [
  {
    id: "log1",
    user: users.manager,
    action: "Created project",
    details: "Project 'Customer Portal Relaunch' was created.",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    impact: "High",
  },
  {
    id: "log2",
    user: users.manager,
    action: "Assigned member",
    details: "Samira Khan was added to 'Customer Portal Relaunch'.",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    impact: "Low",
  },
  {
    id: "log3",
    user: users.manager,
    action: "Updated permissions for 'Payment Gateway Integration'",
    details: "Changed permissions for Samira Khan.",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    impact: "Medium",
  },
];

    