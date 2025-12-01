"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  Globe,
  Monitor,
  Tag,
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
  BarChart,
  Users,
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
} from "recharts"
import type { User } from "@/lib/data"
import { cn } from "@/lib/utils"

interface ReportsDashboardProps {
  user: User
}

const kpiData = {
  passRate: {
    value: "96.4%",
    trend: "+1.2%",
    trendDirection: "up" as const,
    chart: [
      { v: 92 },
      { v: 93 },
      { v: 92.5 },
      { v: 94 },
      { v: 95 },
      { v: 96 },
      { v: 96.4 },
    ],
  },
  executions: {
    value: "1,204",
    trend: "+152",
    trendDirection: "up" as const,
    chart: [{ v: 800 }, { v: 950 }, { v: 900 }, { v: 1050 }, { v: 1100 }, { v: 1204 }],
  },
  coverage: {
    value: "78.2%",
    trend: "+3.0%",
    trendDirection: "up" as const,
    chart: [{ v: 65 }, { v: 68 }, { v: 70 }, { v: 72 }, { v: 75 }, { v: 78.2 }],
  },
  flakyTests: {
    value: "12",
    trend: "-2",
    trendDirection: "down" as const,
    chart: [{ v: 18 }, { v: 15 }, { v: 16 }, { v: 14 }, { v: 13 }, { v: 12 }],
  },
  avgDuration: {
    value: "3m 45s",
    trend: "-12s",
    trendDirection: "down" as const,
    chart: [
      { v: 240 },
      { v: 235 },
      { v: 230 },
      { v: 228 },
      { v: 225 },
    ],
  },
  autoHealing: {
    value: "89%",
    trend: "+5%",
    trendDirection: "up" as const,
    chart: [{ v: 80 }, { v: 82 }, { v: 85 }, { v: 86 }, { v: 89 }],
  },
}

const insights = [
  { title: "High-Risk Feature", content: "The 'new checkout flow' has a 15% lower pass rate than average.", icon: ShieldAlert, color: "text-amber-500" },
  { title: "Auto-Heal Opportunity", content: "AI suggests a fix for 'TC-208' which has failed 3 times.", icon: Wand, color: "text-blue-500" },
  { title: "Flaky Test Detected", content: "'TC-415' is intermittently failing on Firefox. Review needed.", icon: Bug, color: "text-red-500" },
  { title: "Upcoming Regression", content: "The nightly regression suite is scheduled to run in 2 hours.", icon: Clock, color: "text-gray-500" },
];

const teamMetrics = [
    { title: "Team Productivity", value: "+8%", icon: Users },
    { title: "MR Approval Time", value: "4.2h", icon: GitMerge },
    { title: "Team Success Rate", value: "92%", icon: BarChart },
    { title: "Automation Velocity", value: "1.2k lines/week", icon: FlaskConical },
]

const KPICard = ({
  title,
  data,
  icon,
  className,
}: {
  title: string
  data: (typeof kpiData)[keyof typeof kpiData]
  icon: React.ElementType
  className?: string
}) => {
  const Icon = icon
  const trendColor =
    data.trendDirection === "up" ? "text-success" : "text-destructive"

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          "overflow-hidden relative group transition-shadow hover:shadow-subtle",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.value}</div>
          <p className={cn("text-xs", trendColor)}>
            {data.trendDirection === "up" ? "↑" : "↓"} {data.trend}
          </p>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40 group-hover:opacity-70 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  fontSize: "12px",
                  padding: "4px 8px"
                }}
                labelStyle={{ display: "none" }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorUv)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}

export function ReportsDashboard({ user }: ReportsDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Analyze execution trends and team performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="qa">QA</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Browsers</SelectItem>
              <SelectItem value="chrome">Chrome</SelectItem>
              <SelectItem value="firefox">Firefox</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KPICard title="Pass Rate (7d)" data={kpiData.passRate} icon={PieChart} />
        <KPICard title="Total Executions" data={kpiData.executions} icon={Target} />
        <KPICard title="Automation Coverage" data={kpiData.coverage} icon={FlaskConical} />
        <KPICard title="Flaky Tests" data={kpiData.flakyTests} icon={Bug} />
        <KPICard title="Avg. Duration" data={kpiData.avgDuration} icon={Clock} />
        <KPICard title="Auto-Heal Success" data={kpiData.autoHealing} icon={Wand} />
      </div>

       {/* Insights Strip */}
        <div>
            <h3 className="text-sm font-semibold mb-2 uppercase text-muted-foreground tracking-wider">Insights & Actions</h3>
             <div className="flex gap-4 pb-4 overflow-x-auto">
                {insights.map((insight, index) => (
                    <motion.div key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex-shrink-0 w-64"
                    >
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-3 p-4">
                            <insight.icon className={cn("h-6 w-6 flex-shrink-0", insight.color)} />
                            <CardTitle className="text-base">{insight.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">{insight.content}</p>
                        </CardContent>
                    </Card>
                    </motion.div>
                ))}
            </div>
        </div>

      {/* Role-based content */}
      <AnimatePresence mode="wait">
        <motion.div
            key={user.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            exit={{ opacity: 0, y: -20 }}
        >
            {user.role === "manager" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     {teamMetrics.map((metric, i) => (
                        <Card key={metric.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                                <metric.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metric.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Recent Executions</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground">A list of your recent pipeline runs would appear here.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Draft Automations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">A list of your in-progress automation scripts would appear here.</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
