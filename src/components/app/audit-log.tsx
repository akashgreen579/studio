
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
  const [actionFilters, setActionFilters] = useState<Record<string, boolean>>({
    "Created project": true,
    "Assigned member": true,
    "Updated permissions": true,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredLog = useMemo(() => {
    const activeFilters = Object.keys(actionFilters).filter(key => actionFilters[key]);
    if (activeFilters.length === Object.keys(actionFilters).length) return log.slice(0, 5); // Show recent events

    return log.filter(entry => {
        const actionType = entry.action.split(' for')[0].split(' "')[0];
        if(actionFilters["Created project"] && actionType === "Created project") return true;
        if(actionFilters["Assigned member"] && actionType === "Assigned member") return true;
        if(actionFilters["Updated permissions"] && actionType.startsWith("Updated permissions")) return true;
        return false;
    }).slice(0,5);
  }, [log, actionFilters]);

  const getImpactVariant = (impact: "Low" | "Medium" | "High"): "default" | "secondary" | "destructive" => {
    switch (impact) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      default: return "default";
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Audit Events
          </CardTitle>
          <CardDescription className="mt-2">
            A preview of the latest administrative actions.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <ListFilter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.keys(actionFilters).map(filter => (
                        <DropdownMenuCheckboxItem
                            key={filter}
                            checked={actionFilters[filter]}
                            onCheckedChange={checked => setActionFilters(prev => ({...prev, [filter]: checked}))}
                        >
                            {filter}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export (CSV)
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            {filteredLog.map((entry) => (
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
      </CardContent>
    </Card>
  );
}
