
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Tag,
  Filter as FilterIcon,
  Search,
  MoreHorizontal,
  Star,
  Users,
  FolderPlus,
  RefreshCw,
  Shield,
  PlayCircle,
  X,
  ListTodo,
  LayoutGrid,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { testCaseHierarchy, testCases as allTestCases, type TestCase, type User, getEffectivePermissions, type Permissions } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AutomationWorkflowModal } from "./automation-workflow-modal";
import { CreatePipelineModal } from "./create-pipeline-modal";
import { motion, AnimatePresence } from "framer-motion";
import { AdvancedFilterPanel } from "./advanced-filter-panel";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

interface HierarchyItem {
  id: string;
  name: string;
  type: "epic" | "feature" | "folder" | "test-case";
  children?: HierarchyItem[];
}

interface TMTViewProps {
  user: User;
}

const getIcon = (
  type: "epic" | "feature" | "folder" | "test-case",
  isExpanded: boolean
) => {
  const commonClass = "h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors";
  switch (type) {
    case "epic":
      return <Archive className={commonClass} />;
    case "feature":
      return <Folder className={commonClass} />;
    case "folder":
       return isExpanded ? <ChevronDown className={cn(commonClass, "text-primary")} /> : <ChevronRight className={commonClass} />;
    case "test-case":
      return <File className={commonClass} />;
    default:
      return null;
  }
};

const TreeItem = ({ item, level, onSelect, selectedId }: { item: HierarchyItem, level: number, onSelect: (id: string, type: HierarchyItem['type']) => void, selectedId: string | null }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item.id, item.type);
    if(item.children && item.children.length > 0) {
      handleToggle();
    }
  }
  
  const isSelected = selectedId === item.id;

  return (
    <div className="group">
      <div
        className={cn("flex items-center p-1.5 rounded-md cursor-pointer transition-colors", 
          isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'
        )}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        onClick={handleSelect}
      >
        {getIcon(item.type, isExpanded)}
        <span className="text-sm truncate">{item.name}</span>
      </div>
      <AnimatePresence>
      {isExpanded && item.children && item.children.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 overflow-hidden">
          {item.children?.map((child) => (
            <TreeItem key={child.id} item={child} level={level + 1} onSelect={onSelect} selectedId={selectedId}/>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

const TableSkeleton = () => (
    <>
        {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
                <TableCell className="w-[50px]"><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell className="w-[100px]"><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
            </TableRow>
        ))}
    </>
)


export function TMTView({ user }: TMTViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>('epic-1');
    const [selectedType, setSelectedType] = useState<HierarchyItem['type']>('epic');
    const [isWorkflowModalOpen, setWorkflowModalOpen] = useState(false);
    const [isPipelineModalOpen, setPipelineModalOpen] = useState(false);
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
    const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState<any[]>([]);
    const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
    const [isJQLOpen, setJQLOpen] = useState(false);
    const [jqlQuery, setJqlQuery] = useState("");
    const [isJqlValid, setIsJqlValid] = useState<boolean | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast } = useToast();

    const permissions = getEffectivePermissions(user.id);
    const isManager = user.role === 'manager';

    const handleAutomateClick = (testCase: TestCase) => {
      setSelectedTestCase(testCase);
      setWorkflowModalOpen(true);
    };

    const handleSelect = (id: string, type: HierarchyItem['type']) => {
        setSelectedId(id);
        setSelectedType(type);
    }

    const filteredTestCases = useMemo(() => {
        let cases = allTestCases;
        if (searchQuery) {
            cases = cases.filter(tc => 
                tc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tc.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        activeFilters.forEach(filter => {
            if (filter.type === 'Status') {
                cases = cases.filter(tc => tc.status === filter.value);
            }
            if (filter.type === 'Priority') {
                cases = cases.filter(tc => tc.priority === filter.value);
            }
        });

        return cases;
    }, [searchQuery, activeFilters]);

    const handleTestCaseSelection = (testCaseId: string, isSelected: boolean) => {
      setSelectedTestCases(prev => {
        const newSet = new Set(prev);
        if (isSelected) newSet.add(testCaseId);
        else newSet.delete(testCaseId);
        return newSet;
      });
      if(!isMultiSelectActive) setIsMultiSelectActive(true);
    };
    
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedTestCases(new Set(filteredTestCases.map(tc => tc.id)));
        } else {
            setSelectedTestCases(new Set());
        }
        if(!isMultiSelectActive) setIsMultiSelectActive(true);
    }
    
    const selectedTestCasesDetails = useMemo(() => {
        return allTestCases.filter(tc => selectedTestCases.has(tc.id));
    }, [selectedTestCases]);

    const removeFilter = (filterIdToRemove: string) => {
        setActiveFilters(prev => prev.filter(f => f.id !== filterIdToRemove));
    };
    
    const highlightMatch = (text: string) => {
      if (!searchQuery) return text;
      const regex = new RegExp(`(${searchQuery})`, 'gi');
      return text.split(regex).map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-yellow-200/50 rounded-sm px-0.5 py-px">{part}</span>
        ) : (
          part
        )
      );
    };

    const validateAndApplyJql = useCallback(() => {
        if (!jqlQuery) return;
        
        const parts = jqlQuery.split(':');
        const key = parts[0]?.trim().toLowerCase();
        const value = parts[1]?.trim().toLowerCase();

        if (!key || !value) {
            setIsJqlValid(false);
            return;
        }

        const newFilters: any[] = [];
        let isValid = false;

        if (key === 'status') {
             const statusMap: Record<string, any> = {
                'todo': { id: "s1", type: 'Status', value: 'To Do', color: 'bg-blue-100 text-blue-800' },
                'inprogress': { id: "s2", type: 'Status', value: 'In Progress', color: 'bg-amber-100 text-amber-800' },
                'done': { id: "s3", type: 'Status', value: 'Done', color: 'bg-green-100 text-green-800' },
            };
            if (statusMap[value]) {
                newFilters.push(statusMap[value]);
                isValid = true;
            }
        } else if (key === 'priority') {
            const priorityMap: Record<string, any> = {
                'high': { id: "p1", type: 'Priority', value: 'High', color: 'bg-red-100 text-red-800' },
                'medium': { id: "p2", type: 'Priority', value: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
                'low': { id: "p3", type: 'Priority', value: 'Low', color: 'bg-gray-100 text-gray-800' },
            };
            if (priorityMap[value]) {
                newFilters.push(priorityMap[value]);
                isValid = true;
            }
        }

        if (isValid) {
            setActiveFilters(prev => [...prev.filter(f => !newFilters.some(nf => nf.type === f.type)), ...newFilters]);
            setIsJqlValid(true);
            setJqlQuery("");
            setTimeout(() => setJQLOpen(false), 500);
        } else {
            setIsJqlValid(false);
        }
    }, [jqlQuery]);

    useEffect(() => {
        if (jqlQuery.length > 3) {
             const parts = jqlQuery.split(':');
             setIsJqlValid(parts.length === 2 && !!parts[0] && !!parts[1]);
        } else {
            setIsJqlValid(null);
        }
    }, [jqlQuery]);

    const handleRefresh = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            toast({
                title: "TMT Data Refreshed",
                description: "Test cases and modules have been synced.",
            });
        }, 1500);
    }

    const ManagerActionButton = ({ permission, tooltip, children, className, onClick, asChild, disabled }: { permission: keyof (Permissions), tooltip: string, children: React.ReactNode, className?: string, onClick?: () => void, asChild?: boolean, disabled?: boolean }) => {
        const hasPermission = permissions[permission];
        const isDisabled = !hasPermission || disabled;
        
        const buttonContent = (
            <Button variant="outline" size="icon" className={cn("h-10 w-10 p-0 transition-all hover:scale-105 hover:shadow-md active:scale-95", className)} disabled={isDisabled} onClick={onClick} asChild={asChild}>
                {children}
            </Button>
        );

        if (hasPermission) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                        <TooltipContent><p>{tooltip}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        
        return (
             <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild><div tabIndex={0}>{buttonContent}</div></TooltipTrigger>
                    <TooltipContent><p>You do not have permission for this action.</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 h-full">
            {/* Left Panel */}
            <div className="border-r pr-6 flex flex-col">
                 <h2 className="text-lg font-semibold px-2 mb-2">Module Explorer</h2>
                 <p className="text-sm text-muted-foreground px-2 mb-4">Browse test cases by feature.</p>
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter modules..." className="pl-9 h-10"/>
                 </div>
                 <ScrollArea className="flex-grow h-0">
                    <div className="space-y-1 pr-4">
                        {testCaseHierarchy.map(item => <TreeItem key={item.id} item={item} level={0} onSelect={handleSelect} selectedId={selectedId} />)}
                    </div>
                 </ScrollArea>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col">
                {/* Filter Bar */}
                <div className="space-y-2">
                    <div className="flex gap-2 items-center p-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-sm border">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" 
                                    className={cn("h-10 w-10 transition-all hover:scale-105 active:scale-95", isMultiSelectActive && "bg-primary/10 text-primary ring-2 ring-primary/50")}
                                    onClick={() => setIsMultiSelectActive(!isMultiSelectActive)}>
                                        <LayoutGrid className="h-5 w-5"/>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Toggle multi-select mode</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         {isManager && (
                            <ManagerActionButton permission="assignUsers" tooltip="Bulk Actions" asChild disabled={selectedTestCases.size === 0}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-10 w-10 p-0 transition-all hover:scale-105 hover:shadow-md active:scale-95" disabled={selectedTestCases.size === 0}>
                                            <Users className="h-5 w-5"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Assign Selected ({selectedTestCases.size})</DropdownMenuItem>
                                        <DropdownMenuItem>Export Selected ({selectedTestCases.size})</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">Delete Selected</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </ManagerActionButton>
                         )}
                         <ManagerActionButton permission="syncTMT" tooltip="Refresh TMT" onClick={handleRefresh}>
                            <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")}/>
                         </ManagerActionButton>
                        
                        <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                             <Input 
                                placeholder="Search test cases by ID or summary..." 
                                className="pl-10 h-10 text-base rounded-md focus:shadow-md focus:ring-2 ring-primary/50 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                         <ManagerActionButton permission="syncTMT" tooltip="JQL Query" onClick={() => setJQLOpen(!isJQLOpen)}>
                            <SlidersHorizontal className="h-5 w-5"/>
                         </ManagerActionButton>

                        <Button variant="outline" className="h-10 gap-2 hover:scale-105 active:scale-95 transition-transform" onClick={() => setFilterPanelOpen(true)}>
                          <FilterIcon className="h-4 w-4"/> Filters
                        </Button>
                        <Button variant="outline" className="h-10 gap-2 hover:scale-105 active:scale-95 transition-transform">
                          <Star className="h-4 w-4 text-amber-500/80"/> Saved Filters
                        </Button>
                    </div>

                    <AnimatePresence>
                        {isJQLOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="p-3 bg-muted/50 rounded-lg border flex items-center gap-3">
                                    <div className="relative flex-grow">
                                        <div className="flex items-center gap-2 absolute left-2 top-1/2 -translate-y-1/2">
                                            {isJqlValid === true && <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>}
                                            {isJqlValid === false && <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>}
                                            {isJqlValid === null && <div className="h-2.5 w-2.5 rounded-full bg-border"></div>}
                                        </div>
                                        <Input 
                                            placeholder="Enter JQL query (e.g., status:todo or priority:high)" 
                                            className="pl-8 h-9"
                                            value={jqlQuery}
                                            onChange={e => setJqlQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && validateAndApplyJql()}
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={() => setJqlQuery('status:todo')}>status:todo</Button>
                                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={() => setJqlQuery('priority:high')}>priority:high</Button>
                                    </div>
                                    <Button size="sm" onClick={validateAndApplyJql}>Apply</Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {activeFilters.length > 0 && (
                      <div className="flex gap-2 items-center flex-wrap pt-2">
                          <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
                           <AnimatePresence>
                              {activeFilters.map((filter, index) => (
                                <motion.div
                                  key={filter.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                  <Badge className={cn("flex items-center gap-1.5 py-1 px-2 text-sm border-transparent hover:shadow-md", filter.color)}>
                                    {filter.value}
                                    <button onClick={() => removeFilter(filter.id)} className="rounded-full hover:bg-black/10 p-0.5">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                </motion.div>
                              ))}
                          </AnimatePresence>
                          <Button variant="ghost" size="sm" className="text-muted-foreground h-auto p-1 font-medium hover:text-primary transition-colors" onClick={() => setActiveFilters([])}>Clear all</Button>
                      </div>
                    )}
                </div>

                <Separator className="my-4"/>
                
                {/* Test Case Table */}
                <ScrollArea className="flex-grow h-0 rounded-lg border">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                        <TableRow>
                            <TableHead className="w-[50px]">
                              {isMultiSelectActive && <Checkbox 
                                checked={filteredTestCases.length > 0 && selectedTestCases.size === filteredTestCases.length}
                                indeterminate={selectedTestCases.size > 0 && selectedTestCases.size < filteredTestCases.length}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                              />}
                            </TableHead>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isRefreshing ? <TableSkeleton /> : (
                                <AnimatePresence>
                                {filteredTestCases.map(tc => (
                                    <motion.tr 
                                        key={tc.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={cn(selectedTestCases.has(tc.id) && "bg-primary/5")}
                                    >
                                        <TableCell>
                                        {isMultiSelectActive && <Checkbox 
                                            checked={selectedTestCases.has(tc.id)}
                                            onCheckedChange={(checked) => handleTestCaseSelection(tc.id, !!checked)}
                                        />}
                                        </TableCell>
                                        <TableCell className="font-medium">{highlightMatch(tc.id.toUpperCase())}</TableCell>
                                        <TableCell>{highlightMatch(tc.summary)}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                tc.priority === 'High' ? 'destructive' :
                                                tc.priority === 'Medium' ? 'secondary' : 'outline'
                                            }>{tc.priority}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{tc.status}</Badge>
                                        </TableCell>
                                        <TableCell>{tc.assignee}</TableCell>
                                        <TableCell className="text-right">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div tabIndex={permissions.automateTestCases ? -1 : 0}>
                                                            <Button variant="default" size="sm" onClick={() => handleAutomateClick(tc)} disabled={!permissions.automateTestCases}>
                                                                <Sparkles className="mr-2 h-4 w-4"/>Automate</Button>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {!permissions.automateTestCases && <TooltipContent><p>You do not have permission to automate tests.</p></TooltipContent>}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                                </AnimatePresence>
                            )}
                        </TableBody>
                    </Table>
                     {filteredTestCases.length === 0 && !isRefreshing && (
                        <div className="text-center py-24 px-6">
                            <File className="mx-auto h-12 w-12 text-muted-foreground"/>
                            <h3 className="mt-4 text-lg font-medium">No Test Cases Found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                            Try adjusting your search or filters.
                            </p>
                        </div>
                    )}
                </ScrollArea>
                {selectedTestCases.size > 0 && (
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-card border rounded-lg shadow-lg flex items-center justify-between"
                     >
                        <p className="font-medium">{selectedTestCases.size} test case{selectedTestCases.size > 1 ? 's' : ''} selected</p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div tabIndex={permissions.runPipelines ? -1 : 0}>
                                         <Button
                                          disabled={!permissions.runPipelines}
                                          onClick={() => setPipelineModalOpen(true)}
                                        >
                                            <PlayCircle className="mr-2 h-4 w-4"/>
                                            Create Pipeline
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!permissions.runPipelines && <TooltipContent><p>You do not have permission to run pipelines.</p></TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>

                    </motion.div>
                )}
            </div>
        </div>
        
        {selectedTestCase && (
            <AutomationWorkflowModal 
                isOpen={isWorkflowModalOpen}
                setIsOpen={setWorkflowModalOpen}
                testCase={selectedTestCase}
            />
        )}
         <CreatePipelineModal
            isOpen={isPipelineModalOpen}
            setIsOpen={setPipelineModalOpen}
            selectedTestCases={selectedTestCasesDetails}
        />
        <AdvancedFilterPanel
          isOpen={isFilterPanelOpen}
          setIsOpen={setFilterPanelOpen}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
        />
      </>
    );
}
