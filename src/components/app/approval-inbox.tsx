
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, ListFilter } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "../ui/dropdown-menu";

const mockRequests = [
    { id: 1, user: "Samira Khan", project: "Customer Portal Relaunch", permissions: ["Approve/Merge PRs"], justification: "Need to manage hotfixes for the release.", date: new Date(Date.now() - 86400000), status: "Pending" },
    { id: 2, user: "John Doe", project: "Payment Gateway Integration", permissions: ["Sync TMT"], justification: "Aligning test cases with our Jira board.", date: new Date(Date.now() - 172800000), status: "Pending" },
];

export function ApprovalInbox() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Approval Inbox</CardTitle>
                        <CardDescription>Review and act on pending access requests from your team.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filter</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuCheckboxItem>Project</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Permission</DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <Button disabled>Batch Approve (0)</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">User</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Requested Permissions</TableHead>
                            <TableHead>Justification</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.user}</TableCell>
                                <TableCell>{req.project}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {req.permissions.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">{req.justification}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50"><Check className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50"><X className="h-4 w-4"/></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {mockRequests.length === 0 && (
                    <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg mt-4">
                        <h3 className="text-lg font-medium">Inbox Zero!</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                           There are no pending access requests to review.
                        </p>
                    </div>
                 )}
            </CardContent>
        </Card>
    )
}
