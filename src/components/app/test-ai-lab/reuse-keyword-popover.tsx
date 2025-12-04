
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExistingKeyword } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { Check, Code, GitBranch, History } from "lucide-react";

interface ReuseKeywordPopoverProps {
  children: React.ReactNode;
  keyword: ExistingKeyword;
  onConfirm: () => void;
}

export function ReuseKeywordPopover({ children, keyword, onConfirm }: ReuseKeywordPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-semibold">Confirm Keyword Reuse</h4>
            <p className="text-sm text-muted-foreground">
              You are about to map this step to an existing keyword.
            </p>
          </div>
          
          <div className="p-3 rounded-md border bg-muted/50 space-y-2">
            <p className="font-semibold text-sm flex items-center gap-2"><GitBranch className="h-4 w-4"/> {keyword.stepText}</p>
            <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-2"><History className="h-3 w-3"/> Last used {formatDistanceToNow(keyword.lastUsed, { addSuffix: true })}</p>
                <p>Used {keyword.usageCount} times</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2"><Code className="h-4 w-4"/> CODE PREVIEW</p>
            <div className="h-32 rounded-md bg-muted p-2 font-mono text-xs overflow-auto border">
                <pre>{keyword.code}</pre>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button size="sm" onClick={onConfirm}>
                <Check className="h-4 w-4 mr-2"/>
                Confirm & Reuse
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

    
