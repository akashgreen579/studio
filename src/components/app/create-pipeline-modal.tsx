
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Play, Clock, Tag, Globe, Monitor, Users, Repeat, Bell, Bookmark, CalendarIcon } from "lucide-react";
import { type TestCase } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

interface CreatePipelineModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedTestCases: TestCase[];
}

const browsers = ["Chrome", "Firefox", "Safari", "Edge"];

export function CreatePipelineModal({ isOpen, setIsOpen, selectedTestCases }: CreatePipelineModalProps) {
    const { toast } = useToast();
    const [schedule, setSchedule] = useState<"now" | "later">("now");
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>(["Chrome"]);

    const handleRunPipeline = () => {
        toast({
            title: "Pipeline Triggered",
            description: `Executing ${selectedTestCases.length} test cases. You can monitor progress in the Pipelines tab.`,
        });
        setIsOpen(false);
    }
    
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag) {
            e.preventDefault();
            if (!tags.includes(currentTag)) {
                setTags([...tags, currentTag]);
            }
            setCurrentTag("");
        }
    }
    
    const toggleBrowser = (browser: string) => {
        setSelectedBrowsers(prev => 
            prev.includes(browser) 
                ? prev.filter(b => b !== browser)
                : [...prev, browser]
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create New Execution Pipeline</DialogTitle>
                    <DialogDescription>
                        Configure and run a new test pipeline for the selected test cases.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4">
                    {/* Left Column: Configuration */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <Label className="flex items-center gap-2"><Globe className="h-4 w-4"/> Environment</Label>
                             <Select defaultValue="qa">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="qa">QA</SelectItem>
                                    <SelectItem value="staging">Staging</SelectItem>
                                    <SelectItem value="uat">UAT</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                        
                        <div className="space-y-3">
                             <Label className="flex items-center gap-2"><Monitor className="h-4 w-4"/> Browsers</Label>
                             <div className="flex flex-wrap gap-2">
                                {browsers.map(browser => (
                                    <Button 
                                        key={browser} 
                                        variant={selectedBrowsers.includes(browser) ? "default" : "outline"}
                                        onClick={() => toggleBrowser(browser)}
                                        className="transition-transform transform active:scale-95"
                                    >
                                        {browser}
                                    </Button>
                                ))}
                             </div>
                        </div>
                        
                         <Separator />

                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="parallel-toggle" className="flex items-center gap-2 cursor-pointer"><Users className="h-4 w-4"/> Parallel Execution</Label>
                                <Switch id="parallel-toggle" defaultChecked/>
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="retry-count" className="flex items-center gap-2 cursor-pointer"><Repeat className="h-4 w-4"/> Retry on Failure</Label>
                                <Input id="retry-count" type="number" defaultValue={1} className="w-20"/>
                            </div>
                         </div>
                         
                         <Separator />
                         
                         <div className="space-y-2">
                             <Label htmlFor="tags-input" className="flex items-center gap-2"><Tag className="h-4 w-4"/> Tags</Label>
                              <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" onDoubleClick={() => setTags(tags.filter(t => t !== tag))}>{tag}</Badge>
                                ))}
                            </div>
                             <Input 
                                id="tags-input" 
                                placeholder="Add tags and press Enter..."
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddTag}
                             />
                         </div>
                         
                         <Separator />

                        <div className="space-y-4">
                           <Label className="flex items-center gap-2"><Bell className="h-4 w-4"/> Notifications</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="notify-me" defaultChecked/>
                                <Label htmlFor="notify-me" className="font-normal">Notify me on completion</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="notify-channel"/>
                                <Label htmlFor="notify-channel" className="font-normal">Post results to #qa-channel in Slack</Label>
                            </div>
                        </div>


                    </div>
                    {/* Right Column: Summary & Scheduling */}
                    <div className="space-y-6 rounded-lg bg-muted/50 p-6 flex flex-col">
                        <div className="flex-grow">
                            <h3 className="font-semibold mb-2">Summary</h3>
                            <div className="p-4 rounded-md border bg-background">
                                <p className="font-bold text-lg">You are about to run <span className="text-primary">{selectedTestCases.length}</span> automated test cases.</p>
                                <div className="text-sm mt-2 text-muted-foreground flex justify-between">
                                    <span>Est. Duration: ~{Math.ceil(selectedTestCases.length * 1.5)} mins</span>
                                    <span>Parallel Slots: 4/8</span>
                                </div>
                                <ScrollArea className="h-24 mt-2">
                                    <ul className="text-sm text-muted-foreground list-disc pl-5">
                                        {selectedTestCases.map(tc => <li key={tc.id} className="truncate">{tc.id.toUpperCase()}: {tc.summary}</li>)}
                                    </ul>
                                </ScrollArea>
                            </div>
                        </div>

                        <Separator/>

                        <div>
                            <h3 className="font-semibold mb-4">Scheduling</h3>
                             <div className="space-y-4">
                                <div className={`p-4 rounded-lg border cursor-pointer ${schedule === 'now' ? 'bg-primary/10 border-primary' : 'bg-background'}`} onClick={() => setSchedule('now')}>
                                    <div className="flex items-center gap-3">
                                        <Play className="h-6 w-6"/>
                                        <div>
                                            <p className="font-medium">Run Immediately</p>
                                            <p className="text-sm text-muted-foreground">The pipeline will start after confirmation.</p>
                                        </div>
                                    </div>
                                </div>
                                 <div className={`p-4 rounded-lg border cursor-pointer ${schedule === 'later' ? 'bg-primary/10 border-primary' : 'bg-background'}`} onClick={() => setSchedule('later')}>
                                     <div className="flex items-center gap-3">
                                        <Clock className="h-6 w-6"/>
                                        <div>
                                            <p className="font-medium">Schedule for Later</p>
                                            <p className="text-sm text-muted-foreground">Choose a specific date and time to run.</p>
                                        </div>
                                    </div>
                                     {schedule === 'later' && (
                                         <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal mt-4">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {scheduledDate ? format(scheduledDate, "PPP") : "Select a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus/>
                                            </PopoverContent>
                                        </Popover>
                                     )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <DialogFooter>
                    <div className="flex-grow">
                        <Button variant="ghost"><Bookmark className="mr-2 h-4 w-4"/>Save as Template</Button>
                    </div>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleRunPipeline}>
                        {schedule === 'now' ? 'Run Pipeline' : 'Schedule Pipeline'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    