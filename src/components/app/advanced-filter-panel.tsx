
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

interface AdvancedFilterPanelProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const statusOptions = ["To Do", "In Progress", "Done", "Blocked"];
const priorityOptions = ["High", "Medium", "Low"];

export function AdvancedFilterPanel({ isOpen, setIsOpen }: AdvancedFilterPanelProps) {
  
  // Mock state for filters
  const [selectedStatus, setSelectedStatus] = useState(["To Do"]);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
        prev.includes(status) 
            ? prev.filter(s => s !== status)
            : [...prev, status]
    );
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
            <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                    Refine your test case search with specific criteria.
                </SheetDescription>
            </SheetHeader>
            <Separator/>
            <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-6">
                    {/* Status Section */}
                    <div className="space-y-3">
                        <Label>Status</Label>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map(status => (
                                <Button
                                    key={status}
                                    variant={selectedStatus.includes(status) ? "default" : "outline"}
                                    onClick={() => toggleStatus(status)}
                                    className="transition-transform transform active:scale-95"
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <Separator/>

                    {/* Priority Section */}
                    <div className="space-y-3">
                        <Label>Priority</Label>
                        <div className="flex flex-wrap gap-2">
                           {priorityOptions.map(priority => (
                                <Button
                                    key={priority}
                                    variant={selectedPriority === priority ? "default" : "outline"}
                                    onClick={() => setSelectedPriority(priority)}
                                >
                                    {priority}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator/>

                     {/* Assignee Section */}
                    <div className="space-y-3">
                        <Label>Assignee</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search for a user..." className="pl-8"/>
                        </div>
                    </div>

                    <Separator/>

                    {/* Tags Section */}
                    <div className="space-y-3">
                        <Label>Tags</Label>
                         <div className="flex flex-wrap gap-1">
                            <Badge>auth</Badge>
                            <Badge>smoke</Badge>
                         </div>
                        <Input placeholder="Add tags..."/>
                    </div>
                </div>
            </ScrollArea>
            <SheetFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button>Apply Filters (2)</Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
  )
}
