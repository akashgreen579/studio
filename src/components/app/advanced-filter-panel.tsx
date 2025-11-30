
"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Search, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdvancedFilterPanelProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    activeFilters: any[];
    setActiveFilters: (filters: any[]) => void;
}

const statusOptions = [
    { value: "To Do", color: "bg-blue-100 text-blue-800", id: "s1" },
    { value: "In Progress", color: "bg-amber-100 text-amber-800", id: "s2" },
    { value: "Done", color: "bg-green-100 text-green-800", id: "s3" },
    { value: "Blocked", color: "bg-gray-100 text-gray-800", id: "s4" }
];
const priorityOptions = [
    { value: "High", color: "bg-red-100 text-red-800", id: "p1" },
    { value: "Medium", color: "bg-yellow-100 text-yellow-800", id: "p2" },
    { value: "Low", color: "bg-gray-100 text-gray-800", id: "p3" }
];

export function AdvancedFilterPanel({ isOpen, setIsOpen, activeFilters, setActiveFilters }: AdvancedFilterPanelProps) {
  
  const [selectedStatus, setSelectedStatus] = useState<string[]>(activeFilters.filter(f => f.type === 'Status').map(f => f.id));
  const [selectedPriority, setSelectedPriority] = useState<string | null>(activeFilters.find(f => f.type === 'Priority')?.id || null);

  const toggleFilter = (option: any, type: 'Status' | 'Priority') => {
      const isSelected = type === 'Status' 
        ? selectedStatus.includes(option.id)
        : selectedPriority === option.id;
      
      const newActiveFilters = activeFilters.filter(f => f.id !== option.id);
      
      if (!isSelected) {
        if (type === 'Priority') {
           // Remove other priority filters first
           priorityOptions.forEach(p => {
               const index = newActiveFilters.findIndex(f => f.id === p.id);
               if (index > -1) newActiveFilters.splice(index, 1);
           });
           setSelectedPriority(option.id);
        } else {
           setSelectedStatus(prev => [...prev, option.id]);
        }
        newActiveFilters.push({ ...option, type });
      } else {
         if (type === 'Priority') {
            setSelectedPriority(null);
         } else {
            setSelectedStatus(prev => prev.filter(s => s !== option.id));
         }
      }
      
      setActiveFilters(newActiveFilters);
  };
  
  const handleApply = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
            <SheetHeader className="p-6">
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                    Refine your test case search with specific criteria.
                </SheetDescription>
            </SheetHeader>
            <Separator/>
            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-6">
                    {/* Status Section */}
                    <div className="space-y-3">
                        <Label>Status</Label>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map(option => {
                                const isSelected = selectedStatus.includes(option.id);
                                return (
                                <motion.button
                                    key={option.id}
                                    onClick={() => toggleFilter(option, 'Status')}
                                    className={cn("px-3 py-1.5 text-sm font-medium rounded-full border transition-all flex items-center gap-2",
                                        isSelected ? `${option.color} border-transparent shadow-sm` : "bg-background border-border hover:bg-muted"
                                    )}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isSelected && <motion.div layoutId={`check-${option.id}`}><Check className="h-4 w-4"/></motion.div>}
                                    {option.value}
                                </motion.button>
                            )})}
                        </div>
                    </div>
                    
                    <Separator/>

                    {/* Priority Section */}
                    <div className="space-y-3">
                        <Label>Priority</Label>
                        <div className="flex flex-wrap gap-2">
                           {priorityOptions.map(option => {
                                const isSelected = selectedPriority === option.id;
                                return (
                                <motion.button
                                    key={option.id}
                                    onClick={() => toggleFilter(option, 'Priority')}
                                    className={cn("px-3 py-1.5 text-sm font-medium rounded-full border transition-all flex items-center gap-2",
                                        isSelected ? `${option.color} border-transparent shadow-sm` : "bg-background border-border hover:bg-muted"
                                    )}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isSelected && <motion.div layoutId={`check-priority`}><Check className="h-4 w-4"/></motion.div>}
                                    {option.value}
                                </motion.button>
                           )})}
                        </div>
                    </div>

                    <Separator/>

                     {/* Assignee Section */}
                    <div className="space-y-3">
                        <Label>Assignee</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search for a user..." className="pl-9 h-10"/>
                        </div>
                    </div>

                    <Separator/>

                    {/* Tags Section */}
                    <div className="space-y-3">
                        <Label>Tags</Label>
                         <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" size="sm">auth</Button>
                            <Button variant="secondary" size="sm">smoke</Button>
                         </div>
                        <Input placeholder="Add tags..." className="h-10"/>
                    </div>
                </div>
            </ScrollArea>
            <SheetFooter className="p-6 bg-background border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleApply}>Apply Filters</Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
  )
}
