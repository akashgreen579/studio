
"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  FlaskConical,
  Bug,
  Clock,
  Wand,
  Bot,
  ShieldAlert,
  GitMerge,
  BarChart as BarChartIcon,
  Users,
  Eye,
  CheckCheck,
  Percent,
  SlidersHorizontal,
  Inspect,
  X,
  FileText
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Cell,
  Tooltip as RechartsTooltip,
  Line,
  LineChart
} from "recharts"
import type { User } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip"

interface ReportsDashboardProps {
  user: User
}

const kpiData = {
  successRate24h: { value: "98.1%", trend: "+0.5%", trendDirection: "up" as const, chart: [{ v: 97 }, { v: 97.2 }, { v: 97.8 }, { v: 97.5 }, { v: 98.1 }] },
  successRate7d: { value: "96.4%", trend: "+1.2%", trendDirection: "up" as const, chart: [{ v: 92 }, { v: 93 }, { v: 95 }, { v: 94 }, { v: 96.4 }] },
  flakyRate: { value: "2.3%", trend: "-0.8%", trendDirection: "down" as const, chart: [{ v: 4 }, { v: 3.5 }, { v: 3 }, { v: 2.8 }, { v: 2.3 }] },
  coverage: { value: "78.2%", trend: "+3.0%", trendDirection: "up" as const, chart: [{ v: 65 }, { v: 68 }, { v: 72 }, { v: 75 }, { v: 78.2 }] },
  pendingSuggestions: { value: "12", trend: "+3", trendDirection: "up" as const, chart: [{ v: 5 }, { v: 8 }, { v: 9 }, { v: 10 }, { v: 12 }] },
  avgTimeToFix: { value: "4.2h", trend: "-1.1h", trendDirection: "down" as const, chart: [{ v: 8 }, { v: 7 }, { v: 6.5 }, { v: 5 }, { v: 4.2 }] },
}

const suggestions = [
  { id: "s1", type: "Fix Selector", confidence: 95, tests: 3, description: "Selector for #login-button is unstable." },
  { id: "s2", type: "Add Wait", confidence: 88, tests: 2, description: "Add explicit wait before checking for .cart-summary." },
  { id: "s3", type: "Optimize Step", confidence: 75, tests: 5, description: "Consolidate login steps into one keyword." },
];

const recentAiActions = [
  { id: "a1", type: "Auto-Heal", description: "Fixed selector for TC-208 on Firefox.", status: "success" },
  { id: "a2", type: "Merge Request", description: "Generated MR for TC-415 automation.", status: "info" },
  { id: "a3", type: "Error", description: "Could not fix flaky test TC-501.", status: "error" },
];


const KPICard = ({ title, data, icon: Icon, className }: { title: string, data: (typeof kpiData)[keyof typeof kpiData], icon: React.ElementType, className?: string }) => {
  const trendColor = data.trendDirection === "up" ? "text-success" : "text-destructive"
  return (
    <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
      <Card className="overflow-hidden relative group transition-shadow hover:shadow-subtle backdrop-blur-sm bg-card/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.value}</div>
          <p className={cn("text-xs font-semibold", trendColor)}>
            {data.trendDirection === "up" ? "↑" : "↓"} {data.trend}
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30 group-hover:opacity-50 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs><linearGradient id="kpiGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
              <RechartsTooltip contentStyle={{ display: "none" }}/>
              <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}

export function ReportsDashboard({ user }: ReportsDashboardProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const isManager = user.role === 'manager';

  return (
    <div className="space-y-6">
      {/* Top Layer: Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-card/50 backdrop-blur-sm border shadow-sm">
        <div className="flex items-center gap-2">
            <Select defaultValue="proj-1"><SelectTrigger className="w-[180px] font-semibold"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="proj-1">Customer Portal</SelectItem></SelectContent></Select>
            <Select defaultValue="all-modules"><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all-modules">All Modules</SelectItem></SelectContent></Select>
            <Button variant="outline" className="h-10 gap-2"><CalendarDays className="h-4 w-4"/> Last 7 days <ChevronDown className="h-4 w-4"/></Button>
            {isManager && <Select defaultValue="all-users"><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all-users">All Users</SelectItem></SelectContent></Select>}
        </div>
        <div className="flex items-center gap-2">
            <Select defaultValue="test-level"><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="test-level">Test-Level</SelectItem></SelectContent></Select>
            <Button variant="ghost" size="icon" onClick={handleRefresh}><RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")}/></Button>
        </div>
      </div>

      {/* Middle Layer: KPI Band */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KPICard title="Success Rate (24h)" data={kpiData.successRate24h} icon={PieChart} />
        <KPICard title="Success Rate (7d)" data={kpiData.successRate7d} icon={PieChart} />
        <KPICard title="Flaky Test Rate" data={kpiData.flakyRate} icon={Bug} />
        <KPICard title="Automated Coverage" data={kpiData.coverage} icon={Percent} />
        <KPICard title="AI Suggestions" data={kpiData.pendingSuggestions} icon={Bot} />
        <KPICard title="Avg. Time-to-Fix" data={kpiData.avgTimeToFix} icon={Clock} />
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Analytics */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/60 backdrop-blur-sm"><CardHeader><CardTitle>Success Rate Trend</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-muted-foreground"><p>Success Rate Trend Chart Placeholder</p></CardContent></Card>
            <Card className="bg-card/60 backdrop-blur-sm"><CardHeader><CardTitle>Execution Volume</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-muted-foreground"><p>Execution Volume Chart Placeholder</p></CardContent></Card>
            <Card className="bg-card/60 backdrop-blur-sm"><CardHeader><CardTitle>Flaky Test Heatmap</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-muted-foreground"><p>Flaky Test Heatmap Placeholder</p></CardContent></Card>
            <Card className="bg-card/60 backdrop-blur-sm"><CardHeader><CardTitle>Selector Stability</CardTitle></CardHeader><CardContent className="h-64 flex items-center justify-center text-muted-foreground"><p>Selector Stability Chart Placeholder</p></CardContent></Card>
        </div>

        {/* Right Column: AI Insights */}
        <div className="space-y-6 sticky top-24">
            <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>AI Suggestions</CardTitle>
                        <Button variant="ghost" size="sm">Apply All</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {suggestions.map(s => (
                        <div key={s.id} className="p-3 rounded-lg border bg-background/50 space-y-2">
                           <div className="flex items-center justify-between">
                             <p className="font-semibold text-sm flex items-center gap-2">
                                <Wand className="h-4 w-4 text-primary"/> {s.type}
                             </p>
                             <Badge variant="outline" className={s.confidence > 90 ? "text-success border-success/50" : "text-amber-600 border-amber-500/50"}>{s.confidence}%</Badge>
                           </div>
                           <p className="text-xs text-muted-foreground">{s.description}</p>
                           <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-muted-foreground">{s.tests} affected tests</p>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Inspect className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4"/></Button>
                                <Button variant="secondary" size="sm" className="h-7">Apply</Button>
                            </div>
                           </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
             <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader><CardTitle>Recent AI Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {recentAiActions.map(a => (
                         <div key={a.id} className="flex items-center gap-3 text-sm">
                            {a.status === 'success' && <CheckCheck className="h-4 w-4 text-success"/>}
                            {a.status === 'info' && <Bot className="h-4 w-4 text-primary"/>}
                            {a.status === 'error' && <ShieldAlert className="h-4 w-4 text-destructive"/>}
                            <p className="text-muted-foreground">{a.description}</p>
                         </div>
                    ))}
                </CardContent>
            </Card>
             <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader><CardTitle>Anomaly Detector</CardTitle></CardHeader>
                <CardContent className="h-32 flex items-center justify-center text-muted-foreground">
                    <p>No new anomalies detected.</p>
                </CardContent>
            </Card>
        </div>
      </div>
       {isManager && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Team Performance</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader><CardTitle>Team Metrics Placeholder</CardTitle></CardHeader></Card>
              <Card><CardHeader><CardTitle>Approvals Placeholder</CardTitle></CardHeader></Card>
            </div>
          </div>
        )}
    </div>
  )
}
