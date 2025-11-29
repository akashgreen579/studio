
import { PlaceHolderImages } from './placeholder-images';
import { Eye, TestTube, FolderPlus, GitMerge, PlayCircle, type LucideIcon, FilePlus, Settings2, UserPlus, GitBranch, GitCommit, CheckCheck, UserCheck, ShieldAlert } from 'lucide-react';
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
  // Project Permissions
  viewAssignedProjects: boolean;
  automateTestCases: boolean;
  createSrcStructure: boolean;
  runPipelines: boolean;
  approveMergePRs: boolean; // Same as merge pull requests
  
  // Admin/Manager Permissions
  createProject: boolean;
  editProjectSettings: boolean;
  assignUsers: boolean;
  syncTMT: boolean;
  commitAndPublish: boolean;
  approveAccessRequests: boolean;
  adminOverride: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: User;
  members: User[];
  permissions: Record<string, Partial<Permissions>>; // key is userId. Now partial.
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

export const permissionDescriptions: Record<keyof Permissions, { label: string; description: string; icon: LucideIcon; category: 'Project' | 'Management' | 'Admin' }> = {
    // Project
    viewAssignedProjects: { label: "View Projects", description: "Can see projects they are assigned to in their dashboard.", icon: Eye, category: 'Project' },
    automateTestCases: { label: "Automate Tests", description: "Allows user to write and commit new test automation scripts.", icon: TestTube, category: 'Project' },
    createSrcStructure: { label: "Create Folders", description: "Allows user to create new folders under the framework when automating tests.", icon: FolderPlus, category: 'Project' },
    runPipelines: { label: "Run Pipelines", description: "Enables user to trigger CI/CD test execution pipelines.", icon: PlayCircle, category: 'Project' },
    approveMergePRs: { label: "Approve/Merge PRs", description: "Grants permissions to approve and merge pull requests to the main branch.", icon: GitMerge, category: 'Project' },
    commitAndPublish: { label: "Commit & Publish", description: "Allows user to commit code and publish artifacts.", icon: GitCommit, category: 'Project' },

    // Management
    createProject: { label: "Create Project", description: "Allows user to create new testing projects.", icon: FilePlus, category: 'Management' },
    editProjectSettings: { label: "Edit Settings", description: "Can modify project settings, including framework and integrations.", icon: Settings2, category: 'Management' },
    assignUsers: { label: "Assign Users", description: "Can add or remove users from a project and define their roles.", icon: UserPlus, category: 'Management' },
    syncTMT: { label: "Sync TMT", description: "Can sync test cases with an integrated Test Management Tool.", icon: GitBranch, category: 'Management' },
    
    // Admin
    approveAccessRequests: { label: "Approve Requests", description: "Can approve or deny requests for higher permissions.", icon: CheckCheck, category: 'Admin' },
    adminOverride: { label: "Admin Override", description: "Provides unrestricted access to all projects and settings, bypassing standard permissions.", icon: ShieldAlert, category: 'Admin' },
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


export const permissionPresets: Record<string, {name: string, permissions: Partial<Permissions>}> = {
    manager: {
        name: "Manager",
        permissions: { 
            viewAssignedProjects: true, automateTestCases: true, createSrcStructure: true, approveMergePRs: true, runPipelines: true,
            createProject: true, editProjectSettings: true, assignUsers: true, syncTMT: true, commitAndPublish: true,
            approveAccessRequests: true, adminOverride: false,
        }
    },
    senior_qa: {
        name: "Senior QA",
        permissions: { 
            viewAssignedProjects: true, automateTestCases: true, createSrcStructure: true, approveMergePRs: false, runPipelines: true,
            commitAndPublish: true,
        }
    },
    tester: {
        name: "Tester",
        permissions: { 
            viewAssignedProjects: true, automateTestCases: true, createSrcStructure: false, approveMergePRs: false, runPipelines: true,
            commitAndPublish: true,
        }
    },
    viewer: {
        name: "Viewer",
        permissions: { viewAssignedProjects: true }
    }
}

const defaultPermissions: Record<string, Partial<Permissions>> = {
    "user-manager": permissionPresets.manager.permissions,
    "user-employee": permissionPresets.tester.permissions,
};


export const projects: Project[] = [
  {
    id: "proj1",
    name: "Customer Portal Relaunch",
    description: "End-to-end testing for the new customer portal, focusing on user authentication, account management, and order history.",
    owner: users.manager,
    members: [users.manager, users.employee, allUsers[3]],
    permissions: {
        "user-manager": permissionPresets.manager.permissions,
        "user-employee": permissionPresets.senior_qa.permissions,
        "user-2": permissionPresets.senior_qa.permissions 
    },
    lastUpdated: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: "proj2",
    name: "Payment Gateway Integration",
    description: "API and integration testing for the new payment provider. Ensures secure and reliable transaction processing.",
    owner: users.manager,
    members: [users.manager, users.employee, allUsers[2], allUsers[4]],
    permissions: {
        "user-manager": permissionPresets.manager.permissions,
        "user-employee": permissionPresets.tester.permissions,
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


export const mockRequests = [
    { id: 1, user: "Samira Khan", project: "Customer Portal Relaunch", type: "Access Request", permissions: ["Approve/Merge PRs"], justification: "Need to manage hotfixes for the release.", date: new Date(Date.now() - 86400000), status: "Pending" },
    { id: 2, user: "John Doe", project: "Payment Gateway Integration", type: "Merge Request", permissions: [], justification: "feat: add stripe payments", date: new Date(Date.now() - 172800000), status: "Pending" },
    { id: 3, user: "Jane Smith", project: "Customer Portal Relaunch", type: "Folder Creation", permissions: [], justification: "/new_feature/tests", date: new Date(Date.now() - 172800000), status: "Pending" },
];

export const notifications = [
    { id: 1, text: "Pipeline 'Smoke Tests' failed.", category: "Pipelines", read: false },
    { id: 2, text: "AI suggestion for 'TC-205' is ready for review.", category: "Automation", read: false },
    { id: 3, text: "System maintenance is scheduled for tonight at 10 PM.", category: "System", read: true },
];

export const teamPerformanceData = [
    { name: "Samira Khan", avatar: allUsers.find(u=>u.name === 'Samira Khan')?.avatar || '', completed: 12, drafts: 2, successRate: "98%", pending: 1 },
    { name: "John Doe", avatar: allUsers.find(u=>u.name === 'John Doe')?.avatar || '', completed: 8, drafts: 4, successRate: "91%", pending: 0 },
    { name: "Jane Smith", avatar: allUsers.find(u=>u.name === 'Jane Smith')?.avatar || '', completed: 15, drafts: 1, successRate: "99%", pending: 2 },
    { name: "Peter Jones", avatar: allUsers.find(u=>u.name === 'Peter Jones')?.avatar || '', completed: 5, drafts: 0, successRate: "85%", pending: 0 },
];


// This function merges project-specific permissions with global role-based permissions
export const getEffectivePermissions = (userId: string, project?: Project): Permissions => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    let basePermissions: Partial<Permissions> = {};
    if (user.role === 'manager') {
        basePermissions = permissionPresets.manager.permissions;
    } else {
        basePermissions = permissionPresets.tester.permissions; // Default for employees
    }
    
    const projectPermissions = project?.permissions[userId] || {};

    const allPermissionKeys = Object.keys(permissionDescriptions) as (keyof Permissions)[];

    const finalPermissions = {} as Permissions;

    for (const key of allPermissionKeys) {
        finalPermissions[key] = projectPermissions[key] ?? basePermissions[key] ?? false;
    }

    return finalPermissions;
}
