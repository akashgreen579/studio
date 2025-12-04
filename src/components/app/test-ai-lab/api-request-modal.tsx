
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Server, Play, Code as CodeIcon, Vault, RefreshCw } from "lucide-react";

interface ApiRequestModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  gherkinStep: string;
}

const mockResponse = {
  status: 200,
  statusText: "OK",
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-cache",
  },
  body: JSON.stringify(
    {
      id: "user-123",
      name: "John Doe",
      email: "john.doe@example.com",
      roles: ["user", "reader"],
    },
    null,
    2
  ),
};

export function ApiRequestModal({ isOpen, setIsOpen, gherkinStep }: ApiRequestModalProps) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/users/123");
  const [response, setResponse] = useState<any>(null);

  const handleRunRequest = () => {
    // In a real app, this would make an actual API call.
    setResponse(mockResponse);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Server className="h-6 w-6 text-primary" />
            API Request Builder
          </DialogTitle>
          <DialogDescription>
            Create and test an API request for the step:{" "}
            <span className="font-semibold text-foreground">{gherkinStep}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-hidden">
          {/* Left Pane: Request Builder */}
          <div className="flex flex-col space-y-4 overflow-hidden">
            <div className="flex gap-2">
              <Select defaultValue="GET" onValueChange={setMethod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="https://api.example.com/v1/resource"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Tabs defaultValue="headers" className="flex-grow flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="params">Params</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>
              <TabsContent value="headers" className="flex-grow mt-2">
                <div className="p-4 border rounded-md h-full text-sm text-muted-foreground flex items-center justify-center">
                  <p>Key-value header editor placeholder.</p>
                </div>
              </TabsContent>
              <TabsContent value="body" className="flex-grow mt-2">
                <Textarea
                  placeholder="Enter request body (e.g., JSON)"
                  className="h-full resize-none font-mono text-xs"
                />
              </TabsContent>
               <TabsContent value="params" className="flex-grow mt-2">
                <div className="p-4 border rounded-md h-full text-sm text-muted-foreground flex items-center justify-center">
                  <p>Key-value query parameter editor placeholder.</p>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="w-full">
                <Vault className="mr-2 h-4 w-4" />
                Attach Token from Vault
              </Button>
              <Button className="w-full" onClick={handleRunRequest}>
                <Play className="mr-2 h-4 w-4" />
                Run Request
              </Button>
            </div>
          </div>

          {/* Right Pane: Response Viewer */}
          <div className="flex flex-col space-y-4 overflow-hidden">
            <h3 className="font-semibold">Response</h3>
            {response ? (
              <div className="flex-grow flex flex-col border rounded-md overflow-hidden">
                <div className="p-2 border-b flex items-center justify-between bg-muted/50">
                   <div className="flex gap-4">
                     <p className="text-sm">Status: <span className="font-bold text-green-600">{response.status} {response.statusText}</span></p>
                     <p className="text-sm">Time: <span className="font-bold">128ms</span></p>
                   </div>
                   <Button variant="ghost" size="sm" onClick={() => setResponse(null)}><RefreshCw className="mr-2 h-4 w-4"/>Clear</Button>
                </div>
                <Tabs defaultValue="body" className="flex-grow flex flex-col">
                  <TabsList>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body" className="flex-grow mt-2">
                     <ScrollArea className="h-full">
                        <pre className="p-4 font-mono text-xs">{response.body}</pre>
                    </ScrollArea>
                  </TabsContent>
                   <TabsContent value="headers" className="flex-grow mt-2">
                     <ScrollArea className="h-full">
                        <pre className="p-4 font-mono text-xs">{JSON.stringify(response.headers, null, 2)}</pre>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-grow border-2 border-dashed rounded-lg flex items-center justify-center text-center">
                <div>
                  <h4 className="font-semibold">No response yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Run Request" to see the API response here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!response}>
            <CodeIcon className="mr-2 h-4 w-4" /> Generate Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
