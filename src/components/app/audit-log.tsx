"use client";

import type { AuditLogEntry } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, History } from "lucide-react";
import { format } from 'date-fns';

interface AuditLogProps {
  log: AuditLogEntry[];
}

export function AuditLog({ log }: AuditLogProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <CardDescription>
            A log of all creation, assignment, and permission changes.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export (CSV)
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {log.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.user.avatar} data-ai-hint="person face"/>
                      <AvatarFallback>
                        {entry.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{entry.action}</TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.details}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {format(entry.timestamp, "MMM d, yyyy, h:mm a")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
