
import { PlaceHolderImages } from './placeholder-images';
import { Eye, TestTube, FolderPlus, GitMerge, PlayCircle, type LucideIcon, FilePlus, Settings2, UserPlus, GitBranch, GitCommit, CheckCheck, UserCheck, ShieldAlert } from 'lucide-react';
import { ComponentType } from 'react';

// Types
export type Role = "manager" | "employee" | "admin";

export type LabStage = "nlp-cleanup" | "gherkin-preparation" | "keyword-mapping" | "action-simulation" | "code-generation";

export type ActiveView = "dashboard" | "project-settings" | "user-management" | "audit-log" | "approvals" | "tmt-view" | "test-ai-lab" | "keyword-mapping" | "pipelines" | null;


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
  commitAndPublish: boolean;
  
  // Admin/Manager Permissions
  createProject: boolean;
  editProjectSettings: boolean;
  assignUsers: boolean;
  syncTMT: boolean;
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

export interface TestCase {
    id: string;
    summary: string;
    priority: "Low" | "Medium" | "High";
    status: "To Do" | "In Progress" | "Done" | "Automated";
    assignee: string;
    tags: string[];
}

export interface HierarchyItem {
  id: string;
  name: string;
  type: "epic" | "feature" | "folder" | "test-case";
  children?: HierarchyItem[];
}

export interface ExistingKeyword {
    id: string;
    stepText: string;
    filePath: string;
    lastUsed: Date;
    usageCount: number;
    code: string;
}

export type RecordedAction = {
    id: string;
    type: 'navigate' | 'click' | 'type';
    element: string;
    value?: string;
    timestamp: number; // in ms from start
};

export interface PipelineRun {
    id: string;
    status: "Passed" | "Failed" | "Running" | "Scheduled";
    timestamp: Date;
    duration: string;
    triggeredBy: string;
}

export interface Pipeline {
    id: string;
    name: string;
    description: string;
    lastRun: PipelineRun;
    testCases: string[]; // array of TestCase IDs
}

export interface PipelineTemplate {
    id: string;
    name: string;
    description: string;
}

export type ExecutionStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface ExecutionJob {
    id: string;
    testCaseId: string;
    browser: "Chrome" | "Firefox" | "Safari";
    status: ExecutionStatus;
}

export interface ExecutionStep {
    id: string;
    name: string;
    status: "pending" | "running" | "passed" | "failed";
    duration?: number;
    screenshotUrl?: string;
    log?: string;
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
            approveAccessRequests: true, adminOverride: true,
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
            commitAndPublish: false,
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

export const testCases: TestCase[] = [
    { id: "tc-101", summary: "Verify user can log in with valid credentials", priority: "High", status: "To Do", assignee: "Samira Khan", tags: ["auth", "smoke"] },
    { id: "tc-102", summary: "Verify user sees error on invalid login", priority: "High", status: "To Do", assignee: "Samira Khan", tags: ["auth"] },
    { id: "tc-201", summary: "Verify user can add item to cart", priority: "Medium", status: "In Progress", assignee: "John Doe", tags: ["cart", "regression"] },
    { id: "tc-202", summary: "Verify user can remove item from cart", priority: "Medium", status: "Done", assignee: "John Doe", tags: ["cart", "regression"] },
    { id: "tc-203", summary: "Verify cart total updates correctly", priority: "High", status: "Automated", assignee: "Jane Smith", tags: ["cart", "smoke"] },
    { id: "tc-301", summary: "Verify user can view order history", priority: "Low", status: "To Do", assignee: "Peter Jones", tags: ["account"] },
];

export const testCaseHierarchy: HierarchyItem[] = [
    { id: "epic-1", name: "User Authentication", type: 'epic', children: [
        { id: "feat-1-1", name: "Login & Logout", type: 'feature', children: [
            { id: "folder-1-1-1", name: "Positive Scenarios", type: 'folder', children: [
                { id: "tc-101", name: "TC-101: Valid Login", type: 'test-case' }
            ]},
            { id: "folder-1-1-2", name: "Negative Scenarios", type: 'folder', children: [
                 { id: "tc-102", name: "TC-102: Invalid Login", type: 'test-case' }
            ]}
        ]}
    ]},
    { id: "epic-2", name: "Shopping Cart", type: 'epic', children: [
         { id: "feat-2-1", name: "Cart Management", type: 'feature', children: [
             { id: "tc-201", name: "TC-201: Add to Cart", type: 'test-case' },
             { id: "tc-202", name: "TC-202: Remove from Cart", type: 'test-case' },
             { id: "tc-203", name: "TC-203: Verify cart total", type: 'test-case' }
         ]}
    ]},
    { id: "epic-3", name: "User Account", type: 'epic', children: [
         { id: "feat-3-1", name: "Order History", type: 'feature', children: [
             { id: "tc-301", name: "TC-301: View order history", type: 'test-case' }
         ]}
    ]}
];

export const existingKeywords: ExistingKeyword[] = [
    { id: 'kw-1', stepText: "Given I am on the login page", filePath: "com/testcraft/steps/AuthSteps.java", lastUsed: new Date(Date.now() - 86400000 * 5), usageCount: 42, code: `public void onLoginPage() { driver.get("https://example.com/login"); }` },
    { id: 'kw-2', stepText: "When I enter my username and password", filePath: "com/testcraft/steps/AuthSteps.java", lastUsed: new Date(Date.now() - 86400000 * 2), usageCount: 15, code: `public void enterCredentials(String user, String pass) { ... }` },
    { id: 'kw-3', stepText: "And I click the 'Login' button", filePath: "com/testcraft/steps/AuthSteps.java", lastUsed: new Date(Date.now() - 86400000 * 3), usageCount: 23, code: `public void clickLogin() { loginButton.click(); }` },
    { id: 'kw-4', stepText: "Then I should be redirected to the dashboard", filePath: "com/testcraft/steps/NavigationSteps.java", lastUsed: new Date(Date.now() - 86400000 * 10), usageCount: 18, code: `public void verifyDashboardRedirect() { ... }` },
    { id: 'kw-5', stepText: "And a 'Welcome' message should be displayed", filePath: "com/testcraft/steps/DashboardSteps.java", lastUsed: new Date(Date.now() - 86400000 * 1), usageCount: 5, code: `public void checkWelcomeMessage() { ... }` },
    { id: 'kw-6', stepText: 'I add the "{}" to my cart', filePath: "com/testcraft/steps/CartSteps.java", lastUsed: new Date(Date.now() - 86400000 * 7), usageCount: 31, code: `public void addToCart(String item) { ... }` },
];

export const recordedActions: RecordedAction[] = [
    { id: 'rec-1', type: 'navigate', element: 'url', value: 'https://example.com/login', timestamp: 500 },
    { id: 'rec-2', type: 'click', element: 'input[name="username"]', timestamp: 1800 },
    { id: 'rec-3', type: 'type', element: 'input[name="username"]', value: 'testuser', timestamp: 2500 },
    { id: 'rec-4', type: 'click', element: 'input[name="password"]', timestamp: 3200 },
    { id: 'rec-5', type: 'type', element: 'input[name="password"]', value: 'password123', timestamp: 4100 },
    { id: 'rec-6', type: 'click', element: 'button[type="submit"]', timestamp: 5000 },
];

export const generatedCode = {
    pageObject: `
package com.example.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {

    @FindBy(name = "username")
    private WebElement usernameInput;

    @FindBy(name = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;

    public LoginPage(WebDriver driver) {
        PageFactory.initElements(driver, this);
    }

    public void enterUsername(String username) {
        usernameInput.sendKeys(username);
    }

    public void enterPassword(String password) {
        passwordInput.sendKeys(password);
    }

    public void clickLogin() {
        loginButton.click();
    }
}
`,
    stepDefinition: `
package com.example.steps;

import com.example.pages.LoginPage;
import io.cucumber.java.en.When;
import org.openqa.selenium.WebDriver;

public class LoginSteps {

    private WebDriver driver = new Hooks().getDriver();
    private LoginPage loginPage = new LoginPage(driver);

    @When("the user enters their username and password")
    public void userEntersCredentials() {
        loginPage.enterUsername("testuser");
        loginPage.enterPassword("password123");
    }

    @When("the user clicks the 'Login' button")
    public void userClicksLogin() {
        loginPage.clickLogin();
    }
}
`
};

export const draftAutomations = [
    { id: "draft-1", name: "TC-101: User Login", project: "Customer Portal", updated: new Date(Date.now() - 3600000), status: "Code Generation" },
    { id: "draft-2", name: "TC-205: Add to Cart", project: "Payment Gateway", updated: new Date(Date.now() - 86400000 * 2), status: "Keyword Mapping" },
    { id: "draft-3", name: "TC-310: Profile Update", project: "Customer Portal", updated: new Date(Date.now() - 86400000 * 4), status: "NLP Cleanup" },
    { id: "draft-4", name: "TC-415: Search Functionality", project: "Customer Portal", updated: new Date(Date.now() - 86400000 * 5), status: "Gherkin Preparation" },
];

export const pipelines: Pipeline[] = [
    { id: "pipe-1", name: "Full Regression Suite", description: "Runs all regression tests on the QA environment.", lastRun: { id: "run-1", status: "Passed", timestamp: new Date(Date.now() - 3600000 * 2), duration: "24m 11s", triggeredBy: "Alex Hartman" }, testCases: ["tc-101", "tc-102", "tc-201", "tc-202", "tc-203", "tc-301"] },
    { id: "pipe-2", name: "Smoke Tests (Staging)", description: "Runs critical path smoke tests on Staging.", lastRun: { id: "run-2", status: "Running", timestamp: new Date(Date.now() - 3600), duration: "Running", triggeredBy: "CI/CD" }, testCases: ["tc-101", "tc-203", "tc-102"] },
    { id: "pipe-3", name: "Nightly API Checks", description: "Runs all API-level tests every night.", lastRun: { id: "run-3", status: "Passed", timestamp: new Date(Date.now() - 86400000 * 1.5), duration: "8m 5s", triggeredBy: "Scheduler" }, testCases: [] },
    { id: "pipe-4", name: "Scheduled Maintenance Run", description: "A pipeline that is scheduled to run later.", lastRun: { id: "run-4", status: "Scheduled", timestamp: new Date(Date.now() + 86400000 * 2), duration: "-", triggeredBy: "Alex Hartman" }, testCases: [] },
];

export const pipelineTemplates: PipelineTemplate[] = [
    { id: "template-1", name: "New Feature QA", description: "Standard template for QA testing a new feature branch." },
    { id: "template-2", name: "Hotfix Validation", description: "Quick pipeline to validate a hotfix before deploying to production." },
];

export const executionJobs: ExecutionJob[] = [
    { id: "job-1", testCaseId: "tc-101", browser: "Chrome", status: "passed" },
    { id: "job-2", testCaseId: "tc-101", browser: "Firefox", status: "passed" },
    { id: "job-3", testCaseId: "tc-203", browser: "Chrome", status: "failed" },
    { id: "job-4", testCaseId: "tc-203", browser: "Firefox", status: "running" },
    { id: "job-5", testCaseId: "tc-102", browser: "Chrome", status: "running" },
    { id: "job-6", testCaseId: "tc-102", browser: "Firefox", status: "pending" },
];

export const executionSteps: ExecutionStep[] = [
    { id: "step-1", name: "Given the user is on the login page", status: "passed", duration: 1520, log: "Navigated to /login" },
    { id: "step-2", name: "When the user enters 'testuser' and 'password123'", status: "passed", duration: 2100, log: "Entered credentials" },
    { id: "step-3", name: "And the user clicks the 'Login' button", status: "failed", duration: 5033, log: "TIMEOUT: Element with selector `button.login-btn` not found after 5000ms.", screenshotUrl: "https://placehold.co/600x400/FFF0F0/E04545?text=Error" },
    { id: "step-4", name: "Then the user is redirected to the dashboard", status: "pending", log: "" },
];



// This function merges project-specific permissions with global role-based permissions
export const getEffectivePermissions = (userId: string, project?: Project): Permissions => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        // Return a default set of no permissions if user not found
        const allFalse = {} as Permissions;
        (Object.keys(permissionDescriptions) as Array<keyof Permissions>).forEach(key => {
            allFalse[key] = false;
        });
        return allFalse;
    }

    let basePermissions: Partial<Permissions> = {};
    if (user.role === 'manager') {
        basePermissions = permissionPresets.manager.permissions;
    } else { // 'employee'
        // Employees have no base permissions globally, they are granted per project.
        basePermissions = { runPipelines: true, automateTestCases: true, viewAssignedProjects: true };
    }
    
    // Project-specific permissions override the base role permissions.
    const projectPermissions = project?.permissions[userId] || {};

    // Combine base and project-specific permissions
    const combinedPermissions: Partial<Permissions> = { ...basePermissions, ...projectPermissions };

    const allPermissionKeys = Object.keys(permissionDescriptions) as (keyof Permissions)[];

    const finalPermissions = {} as Permissions;

    // Ensure all permission keys are present and default to false if not specified.
    for (const key of allPermissionKeys) {
        finalPermissions[key] = combinedPermissions[key] ?? false;
    }

    return finalPermissions;
}
