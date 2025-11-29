
"use client";

import type { AuditLogEntry, User, Project } from "@/lib/data";
import { allUsers, projects as allProjects } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ListFilter, Calendar as CalendarIcon, User as UserIcon, File as FileIcon, Type } from "lucide-react";
import { format } from 'date-fns';
import { DateRange } from "react-day-picker";
import { useEffect, useState, useMemo } from "react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { AuditLog } from "./audit-log";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";

interface AuditLogScreenProps {
  log: AuditLogEntry[];
}

export function AuditLogScreen({ log }: AuditLogScreenProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [userFilters, setUserFilters] = useState<string[]>([]);
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [actionFilters, setActionFilters] = useState<string[]>([]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(log.map(entry => entry.action.split(' for')[0].split(' "')[0]));
    return Array.from(actions);
  }, [log]);
  
  useEffect(() => {
    setActionFilters(uniqueActions);
    setUserFilters(allUsers.map(u => u.id));
    setProjectFilters(allProjects.map(p => p.id));
  }, [uniqueActions]);

  const filteredLog = useMemo(() => {
    return log.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      if (date?.from && entryDate < date.from) return false;
      if (date?.to && entryDate > date.to) return false;
      if (!userFilters.includes(entry.user.id)) return false;
      
      const actionType = entry.action.split(' for')[0].split(' "')[0];
      if (!actionFilters.includes(actionType)) return false;

      const projectNameMatch = entry.details.match(/'([^']+)'/);
      if (projectNameMatch) {
          const projectName = projectNameMatch[1];
          const project = allProjects.find(p => p.name === projectName);
          if (project && !projectFilters.includes(project.id)) {
              return false;
          }
      } else if (entry.action.includes('Created project')) {
         const projectNameMatch = entry.action.match(/"([^"]+)"/);
         if(projectNameMatch) {
            const projectName = projectNameMatch[1];
            const project = allProjects.find(p => p.name === projectName);
            if (project && !projectFilters.includes(project.id)) {
                return false;
            }
         }
      }

      return true;
    });
  }, [log, date, userFilters, actionFilters, projectFilters]);

    const handleExport = () => {
        const headers = ["Timestamp", "User Name", "User Email", "Action", "Details", "Impact"];
        const csvContent = [
            headers.join(','),
            ...filteredLog.map(entry => [
                `"${format(entry.timestamp, "yyyy-MM-dd HH:mm:ss")}"`,
                `"${entry.user.name}"`,
                `"${entry.user.email}"`,
                `"${entry.action}"`,
                `"${entry.details.replace(/"/g, '""')}"`,
                `"${entry.impact}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    const onCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string, checked: boolean) => {
        setter(prev => checked ? [...prev, item] : prev.filter(i => i !== item));
    }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>Track all user and system actions across the platform.</CardDescription>
            </div>
            <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Export (CSV)
            </Button>
        </div>
        <div className="flex items-center gap-2 pt-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button id="date" variant={"outline"} className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (date.to ? <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</> : format(date.from, "LLL dd, y")) : <span>Pick a date range</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                </PopoverContent>
            </Popover>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline"><UserIcon className="mr-2 h-4 w-4" /> Users ({userFilters.length}/{allUsers.length})</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                    {allUsers.map(user => (
                        <DropdownMenuCheckboxItem key={user.id} checked={userFilters.includes(user.id)} onCheckedChange={c => onCheckboxChange(setUserFilters, user.id, !!c)}>{user.name}</DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline"><Type className="mr-2 h-4 w-4" /> Actions ({actionFilters.length}/{uniqueActions.length})</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                    {uniqueActions.map(action => (
                        <DropdownMenuCheckboxItem key={action} checked={actionFilters.includes(action)} onCheckedChange={c => onCheckboxChange(setActionFilters, action, !!c)}>{action}</DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline"><FileIcon className="mr-2 h-4 w-4" /> Projects ({projectFilters.length}/{allProjects.length})</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                     {allProjects.map(proj => (
                        <DropdownMenuCheckboxItem key={proj.id} checked={projectFilters.includes(proj.id)} onCheckedChange={c => onCheckboxChange(setProjectFilters, proj.id, !!c)}>{proj.name}</DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
             <Button variant="ghost" onClick={() => {
                setDate(undefined);
                setActionFilters(uniqueActions);
                setUserFilters(allUsers.map(u => u.id));
                setProjectFilters(allProjects.map(p => p.id));
             }}>Reset</Button>
        </div>
      </CardHeader>
      <CardContent>
        <AuditLog log={filteredLog} />
      </CardContent>
    </Card>
  );
}
