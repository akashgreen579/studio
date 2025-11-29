
"use client";

import { useState, useMemo, useCallback } from "react";
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
  UserPlus,
  FolderPlus,
  RefreshCw,
  Shield,
  PlayCircle,
  X,
  ListTodo,
} from "lucide-react";
import { testCaseHierarchy, testCases as allTestCases, type TestCase, type User, getEffectivePermissions, permissionDescriptions } from "@/lib/data";
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
  const commonClass = "h-4 w-4 mr-2 flex-shrink-0";
  switch (type) {
    case "epic":
      return <Archive className={commonClass} />;
    case "feature":
      return <Folder className={commonClass} />;
    case "folder":
      return isExpanded ? <ChevronDown className={commonClass} /> : <ChevronRight className={commonClass} />;
    case "test-case":
      return <File className={commonClass} />;
    default:
      return null;
  }
};

const TreeItem = ({ item, level, onSelect, selectedId }: { item: HierarchyItem, level: number, onSelect: (id: string, type: HierarchyItem['type']) => void, selectedId: string | null }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const hasChildren = item.children && item.children.length > 0;
  
  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onSelect(item.id, item.type);
  };
  
  const isSelected = selectedId === item.id;

  return (
    <div>
      <div
        className={`flex items-center p-1.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        onClick={handleToggle}
      >
        {getIcon(item.type, isExpanded)}
        <span className="text-sm truncate">{item.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {item.children?.map((child) => (
            <TreeItem key={child.id} item={child} level={level + 1} onSelect={onSelect} selectedId={selectedId}/>
          ))}
        </div>
      )}
    </div>
  );
};


export function TMTView({ user }: TMTViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>('epic-1');
    const [selectedType, setSelectedType] = useState<HierarchyItem['type']>('epic');
    const [isWorkflowModalOpen, setWorkflowModalOpen] = useState(false);
    const [isPipelineModalOpen, setPipelineModalOpen] = useState(false);
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
    const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
    const [activeFilters, setActiveFilters] = useState<any[]>([
      { type: 'Status', value: 'To Do', color: 'bg-blue-100 text-blue-800' },
      { type: 'Priority', value: 'High', color: 'bg-red-100 text-red-800' }
    ]);


    const permissions = getEffectivePermissions(user.id);
    const canAutomate = permissions.automateTestCases;
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
        if (!selectedId) return allTestCases;
        
        // This is a mock filter. A real implementation would recursively search the tree.
        switch(selectedType) {
            case 'epic':
                return allTestCases.filter(tc => tc.id.startsWith('tc-1') || tc.id.startsWith('tc-2'));
            case 'feature':
                 if (selectedId === 'feat-1-1') return allTestCases.filter(tc => tc.id.startsWith('tc-1'));
                 return allTestCases;
            case 'folder':
                if (selectedId === 'folder-1-1-1') return allTestCases.filter(tc => tc.id === 'tc-101' || tc.id === 'tc-102');
                return [];
            case 'test-case':
                return allTestCases.filter(tc => tc.id === selectedId);
            default:
                return allTestCases;
        }
    }, [selectedId, selectedType]);

    const handleTestCaseSelection = (testCaseId: string, isSelected: boolean) => {
      setSelectedTestCases(prev => {
        const newSet = new Set(prev);
        if (isSelected) {
          newSet.add(testCaseId);
        } else {
          newSet.delete(testCaseId);
        }
        return newSet;
      });
    };

    const handleSelectAll = (isSelected: boolean) => {
      if (isSelected) {
        setSelectedTestCases(new Set(filteredTestCases.map(tc => tc.id)));
      } else {
        setSelectedTestCases(new Set());
      }
    };

    const selectedTestCasesDetails = useMemo(() => {
        return allTestCases.filter(tc => selectedTestCases.has(tc.id));
    }, [selectedTestCases]);

    const removeFilter = (filterToRemove: any) => {
      setActiveFilters(prev => prev.filter(f => f.value !== filterToRemove.value));
    };

    const ManagerActionButton = ({ permission, tooltip, children, className }: { permission: keyof Permissions, tooltip: string, children: React.ReactNode, className?: string }) => {
        const hasPermission = permissions[permission];

        if (hasPermission) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className={cn("h-10 w-10 p-0", className)}>
                                {children}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>{tooltip}</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
        return (
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <div tabIndex={0}>
                            <Button variant="outline" size="icon" disabled className={cn("h-10 w-10 p-0", className)}>
                                {children}
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>You do not have permission to perform this action.</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    };


    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 h-full">
            {/* Left Panel */}
            <div className="border-r pr-6">
                 <h2 className="text-lg font-semibold px-2 mb-2">Module Explorer</h2>
                 <p className="text-sm text-muted-foreground px-2 mb-4">Browse test cases by feature.</p>
                 <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Filter modules..." className="pl-8"/>
                 </div>
                 <ScrollArea className="h-[calc(100vh-220px)]">
                    <div className="space-y-1 pr-4">
                        {testCaseHierarchy.map(item => <TreeItem key={item.id} item={item} level={0} onSelect={handleSelect} selectedId={selectedId} />)}
                    </div>
                 </ScrollArea>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col">
                {/* Filter Bar */}
                <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" className="h-10 w-10 p-0"><ListTodo className="h-5 w-5"/></Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Toggle multi-select</p></TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                         {isManager && (
                            <ManagerActionButton permission="assignUsers" tooltip="Bulk Actions">
                                <Users className="h-5 w-5"/>
                            </ManagerActionButton>
                         )}
                         <ManagerActionButton permission="syncTMT" tooltip="Refresh TMT">
                            <RefreshCw className="h-5 w-5"/>
                         </ManagerActionButton>
                        
                        <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                             <Input placeholder="Search test cases by ID or summary..." className="pl-10 h-10 text-base" />
                        </div>
                        <Button variant="outline" className="h-10 gap-2" onClick={() => setFilterPanelOpen(true)}>
                          <FilterIcon className="h-4 w-4"/> Filters
                        </Button>
                        <Button variant="outline" className="h-10 gap-2">
                          <Star className="h-4 w-4 text-amber-500"/> Saved Filters
                        </Button>
                        <Button
                          className="h-10"
                          disabled={selectedTestCases.size === 0 || !permissions.runPipelines}
                          onClick={() => setPipelineModalOpen(true)}
                        >
                            <PlayCircle className="mr-2 h-4 w-4"/>
                            Create Pipeline ({selectedTestCases.size})
                        </Button>
                    </div>
                    {activeFilters.length > 0 && (
                      <div className="flex gap-2 items-center">
                          <span className="text-sm text-muted-foreground">Active filters:</span>
                           <AnimatePresence>
                              {activeFilters.map((filter, index) => (
                                <motion.div
                                  key={filter.value}
                                  layout
                                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: -10, scale: 0.8 }}
                                  transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                  <Badge className={`flex items-center gap-1.5 ${filter.color} border border-transparent`}>
                                    {filter.value}
                                    <button onClick={() => removeFilter(filter)} className="rounded-full hover:bg-black/10 p-0.5">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                </motion.div>
                              ))}
                          </AnimatePresence>
                          <Button variant="ghost" size="sm" className="text-muted-foreground h-auto p-1" onClick={() => setActiveFilters([])}>Clear all</Button>
                      </div>
                    )}
                </div>

                <Separator className="my-4"/>
                
                {/* Test Case Table */}
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                              <Checkbox 
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                checked={filteredTestCases.length > 0 && selectedTestCases.size === filteredTestCases.length}
                                indeterminate={selectedTestCases.size > 0 && selectedTestCases.size < filteredTestCases.length}
                              />
                            </TableHead>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {permissions.adminOverride && <Shield className="h-4 w-4 text-muted-foreground" title="Manager Actions"/>}
                                <span>Actions</span>
                              </div>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTestCases.map(tc => (
                                <TableRow key={tc.id} data-state={selectedTestCases.has(tc.id) && "selected"}>
                                    <TableCell>
                                      <Checkbox 
                                        checked={selectedTestCases.has(tc.id)}
                                        onCheckedChange={(checked) => handleTestCaseSelection(tc.id, !!checked)}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">{tc.id.toUpperCase()}</TableCell>
                                    <TableCell>{tc.summary}</TableCell>
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
                                                    <div tabIndex={canAutomate ? -1 : 0}>
                                                        <Button variant="default" size="sm" onClick={() => handleAutomateClick(tc)} disabled={!canAutomate}>Automate</Button>
                                                    </div>
                                                </TooltipTrigger>
                                                {!canAutomate && <TooltipContent><p>{permissionDescriptions.automateTestCases.description}</p></TooltipContent>}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {filteredTestCases.length === 0 && (
                    <div className="text-center py-24 px-6 border-2 border-dashed rounded-lg mt-4">
                        <File className="mx-auto h-12 w-12 text-muted-foreground"/>
                        <h3 className="mt-4 text-lg font-medium">No Test Cases Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                           Select a module from the explorer or adjust your filters.
                        </p>
                    </div>
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
        />
      </>
    );
}
