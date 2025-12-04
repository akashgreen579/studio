
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Video, Server } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  gherkinStep: string;
}

const boilerplateCode = `
@When("{gherkinStep}")
public void {methodName}() {
    // TODO: Implement action
    System.out.println("Executing step: {gherkinStep}");
}
`;

export const CreateKeywordModal = ({ isOpen, setIsOpen, gherkinStep }: ModalProps) => {
    const methodName = gherkinStep
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(' ')
        .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    const generatedCode = boilerplateCode.replace(/{gherkinStep}/g, gherkinStep).replace('{methodName}', methodName);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Keyword</DialogTitle>
                    <DialogDescription>
                        Define a new reusable keyword for the step: "{gherkinStep}"
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                         <div>
                            <Label htmlFor="method-name">Method Name</Label>
                            <Input id="method-name" defaultValue={methodName} />
                        </div>
                        <div>
                            <Label htmlFor="file-path">File Path</Label>
                             <Select defaultValue="com/testcraft/steps/AuthSteps.java">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="com/testcraft/steps/AuthSteps.java">com/testcraft/steps/AuthSteps.java</SelectItem>
                                     <SelectItem value="com/testcraft/steps/CartSteps.java">com/testcraft/steps/CartSteps.java</SelectItem>
                                      <SelectItem value="com/testcraft/steps/NavigationSteps.java">com/testcraft/steps/NavigationSteps.java</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Boilerplate Code Preview</Label>
                        <div className="h-48 rounded-md bg-muted p-4 font-mono text-xs overflow-auto">
                            <pre>{generatedCode}</pre>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsOpen(false)}>Create Keyword</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export const RecordKeywordModal = ({ isOpen, setIsOpen, gherkinStep }: ModalProps) => {
    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record New Keyword</DialogTitle>
                    <DialogDescription>
                        Record user actions in a simulated browser to generate the logic for: "{gherkinStep}"
                    </DialogDescription>
                </DialogHeader>
                <div className="h-64 my-4 flex flex-col items-center justify-center text-center bg-muted/50 border-2 border-dashed rounded-lg">
                    <Video className="h-12 w-12 text-muted-foreground"/>
                    <p className="mt-4 font-semibold">Action Simulation</p>
                    <p className="text-sm text-muted-foreground">A mini-recorder would open here.</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsOpen(false)}>Start Recording</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    