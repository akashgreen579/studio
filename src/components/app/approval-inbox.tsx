
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, ListFilter, CheckCheck, GitMerge, FolderKanban } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "../ui/dropdown-menu";
import { mockRequests } from "@/lib/data";

const getApprovalIcon = (type: string) => {
    const className = "h-4 w-4 text-muted-foreground";
    switch(type) {
        case "Access Request": return <CheckCheck className={className} />;
        case "Merge Request": return <GitMerge className={className} />;
        case "Folder Creation": return <FolderKanban className={className} />;
        default: return null;
    }
}

export function ApprovalInbox() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Approval Inbox</CardTitle>
                        <CardDescription>Review and act on pending requests from your team.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline"><ListFilter className="mr-2 h-4 w-4" /> Filter</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuCheckboxItem>Project</DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem>Request Type</DropdownMenuCheckboxItem>
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
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockRequests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.user}</TableCell>
                                <TableCell>{req.project}</TableCell>
                                 <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getApprovalIcon(req.type)}
                                        <span>{req.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">
                                    {req.permissions && req.permissions.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {req.permissions.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                                        </div>
                                    ) : req.justification}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="outline" size="sm">Inspect</Button>
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
                           There are no pending requests to review.
                        </p>
                    </div>
                 )}
            </CardContent>
        </Card>
    )
}
