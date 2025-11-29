
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Tag,
  Filter,
  Search,
  MoreHorizontal,
  Star,
  UserPlus,
  FolderPlus,
  RefreshCw,
  Shield,
} from "lucide-react";
import { testCaseHierarchy, testCases as allTestCases, type TestCase, type User } from "@/lib/data";
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
    const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

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

    const ManagerActions = () => (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <UserPlus className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Assign User</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <FolderPlus className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Create Folder Structure</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4"/>
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Refresh TMT</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Separator orientation="vertical" className="h-6 mx-2" />
      </div>
    );

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
            <div>
                {/* Filter Bar */}
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex gap-2 items-center">
                        {isManager && <ManagerActions />}
                        <div className="relative flex-grow">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input placeholder="Search test cases by ID or summary..." className="pl-8" />
                        </div>
                        <Button variant="outline"><Filter className="mr-2 h-4 w-4"/> Filters</Button>
                        <Button variant="outline" className="text-amber-600"><Star className="mr-2 h-4 w-4"/> Saved Filters</Button>
                        <Button>Query Builder</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        <Badge variant="secondary">Status: To Do</Badge>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">Clear all</Button>
                    </div>
                </div>

                <Separator />
                
                {/* Test Case Table */}
                <div className="rounded-lg border mt-4">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"><Checkbox /></TableHead>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isManager && <Shield className="h-4 w-4 text-muted-foreground" title="Manager Actions"/>}
                                <span>Actions</span>
                              </div>
                            </TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTestCases.map(tc => (
                                <TableRow key={tc.id}>
                                    <TableCell><Checkbox /></TableCell>
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
                                        <Button variant="default" size="sm" onClick={() => handleAutomateClick(tc)}>Automate</Button>
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
      </>
    );
}
