

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
import { Download, History, ListFilter } from "lucide-react";
import { format } from 'date-fns';
import { useEffect, useState, useMemo } from "react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";

interface AuditLogProps {
  log: AuditLogEntry[];
}

export function AuditLog({ log }: AuditLogProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getImpactVariant = (impact: "Low" | "Medium" | "High"): "default" | "secondary" | "destructive" => {
    switch (impact) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      default: return "default";
    }
  };

  return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-center">Impact</TableHead>
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
                <TableCell>
                  <Badge variant={entry.action.includes('Created') ? "secondary" : "outline"} className="font-normal">
                    {entry.action.split(' for')[0].split(' "')[0]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.details}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getImpactVariant(entry.impact)}>{entry.impact}</Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {isClient ? format(entry.timestamp, "MMM d, h:mm a") : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
  );
}
