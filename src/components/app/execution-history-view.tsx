"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  Globe,
  Monitor,
  Tag,
  Wand,
  Repeat,
  ShieldQuestion,
  ChevronDown,
  Loader,
  CheckCircle2,
  XCircle,
  Clock,
  BrainCircuit,
} from "lucide-react"
import { executionHistory } from "@/lib/data"
import type { ExecutionHistoryEntry, User } from "@/lib/data"
import { format, formatDistanceToNow } from "date-fns"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ExecutionHistoryViewProps {
  user: User
}

const statusOptions = ["Passed", "Failed", "Blocked", "Skipped"]
const browserOptions = ["Chrome", "Firefox", "Safari", "Edge"]
const environmentOptions = ["QA", "Staging", "Production"]
const tagOptions = ["smoke", "regression", "api", "auth"]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Passed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "Failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "Running":
      return <Loader className="h-4 w-4 animate-spin text-blue-500" />
    case "Scheduled":
      return <Clock className="h-4 w-4 text-amber-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

export function ExecutionHistoryView({ user }: ExecutionHistoryViewProps) {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Execution Results Explorer
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Search, filter, and analyze historical pipeline runs.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-grow min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by pipeline, test ID..."
                    className="pl-9 h-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 h-10">
                      <Filter className="h-4 w-4" /> Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map(status => (
                        <DropdownMenuCheckboxItem key={status}>{status}</DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-[240px] justify-start text-left font-normal h-10">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Pick a date range</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar initialFocus mode="range" numberOfMonths={2} />
                    </PopoverContent>
                </Popover>
                <Button variant="ghost">Clear Filters</Button>
                 <Button>Save Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
             <CardHeader>
                <CardTitle>Execution Runs</CardTitle>
                <CardDescription>Showing 5 of 1,283 results.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Pipeline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>AI Flags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {executionHistory.map((run) => (
                        <React.Fragment key={run.id}>
                          <TableRow
                            onClick={() =>
                              setExpandedRow(expandedRow === run.id ? null : run.id)
                            }
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  expandedRow === run.id && "rotate-180"
                                )}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {run.pipelineName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  run.status === "Passed"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={cn(
                                  "gap-1.5 pl-1.5",
                                  run.status === "Passed" && "bg-green-100 text-green-800 border-green-200/80 shadow-sm animate-glow-border-green",
                                  run.status === "Failed" && "bg-red-100 text-red-800 border-red-200/80 shadow-sm"
                                )}
                              >
                                {getStatusIcon(run.status)}
                                {run.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{run.duration}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {run.triggeredBy} on {run.environment}/{run.browser}
                            </TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(run.startTime), {
                                addSuffix: true,
                              })}
                            </TableCell>
                             <TableCell>
                               <div className="flex gap-2">
                                {run.aiFlags.includes("Auto-Healed") && <Badge variant="outline" className="gap-1.5 border-blue-400 bg-blue-50 text-blue-700"><Wand className="h-3 w-3"/> Auto-Healed</Badge>}
                                {run.aiFlags.includes("Flaky") && <Badge variant="outline" className="gap-1.5 border-amber-400 bg-amber-50 text-amber-700"><Repeat className="h-3 w-3"/> Flaky</Badge>}
                                {run.aiFlags.includes("Known-Failure") && <Badge variant="outline" className="gap-1.5 border-gray-400 bg-gray-50 text-gray-700"><ShieldQuestion className="h-3 w-3"/> Known</Badge>}
                               </div>
                            </TableCell>
                          </TableRow>
                          {expandedRow === run.id && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <TableCell colSpan={7} className="p-0">
                                <div className="p-4 bg-muted/50">
                                  <h4 className="font-semibold mb-2">
                                    Run Details
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Detailed logs, artifacts, and test results would appear here.
                                  </p>
                                </div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Showing 1-5 of 1283 results</p>
                  <div className="flex gap-2">
                      <Button variant="outline">Previous</Button>
                      <Button variant="outline">Next</Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Summary Panel */}
        <div className="space-y-6 sticky top-24">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Based on current filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-muted">
                    <span className="font-medium">Total Runs</span>
                    <span className="font-bold text-lg">1,283</span>
                </div>
                 <div className="flex justify-between items-center p-3 rounded-md bg-muted">
                    <span className="font-medium">Pass Rate</span>
                    <span className="font-bold text-lg text-green-600">92.1%</span>
                </div>
                 <div className="flex justify-between items-center p-3 rounded-md bg-muted">
                    <span className="font-medium">Average Duration</span>
                    <span className="font-bold text-lg">5m 12s</span>
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span>QA:</span><span className="font-medium">890 runs</span></div>
                <div className="flex justify-between"><span>Staging:</span><span className="font-medium">350 runs</span></div>
                <div className="flex justify-between"><span>Production:</span><span className="font-medium">43 runs</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
