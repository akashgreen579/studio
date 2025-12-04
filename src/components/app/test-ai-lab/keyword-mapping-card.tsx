
"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Code, Video, Check, Info, Server, ChevronDown } from "lucide-react";
import { type StepMapping } from "./keyword-mapping-view";
import { ReuseKeywordPopover } from "./reuse-keyword-popover";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { existingKeywords } from "@/lib/data";


interface KeywordMappingCardProps {
  mapping: StepMapping;
  onUpdate: (newMapping: Partial<StepMapping>) => void;
  onCreate: () => void;
  onRecord: () => void;
  onApi: () => void;
}

const SimilarityBadge = ({ similarity }: { similarity: number | null }) => {
  if (!similarity) return null;
  
  let colorClass = "bg-gray-100 text-gray-800 border-gray-200/80";
  if (similarity > 80) colorClass = "bg-green-100 text-green-800 border-green-200/80";
  else if (similarity > 60) colorClass = "bg-amber-100 text-amber-800 border-amber-200/80";

  return (
    <Badge variant="outline" className={cn("font-semibold", colorClass)}>
      {Math.round(similarity)}% Similar
    </Badge>
  );
};


export const KeywordMappingCard = ({ mapping, onUpdate, onCreate, onRecord, onApi }: KeywordMappingCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isReused, setIsReused] = useState(false);

  useEffect(() => {
    if (mapping.action === 'reuse' && !isReused) {
        setIsReused(true);
        const timer = setTimeout(() => setIsReused(false), 2000);
        return () => clearTimeout(timer);
    }
  }, [mapping.action, isReused]);


  const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };
  
  const handleReuse = () => {
    onUpdate({ action: 'reuse', status: 'resolved' });
  };
  
  const handleCreate = () => {
      onUpdate({ action: 'create', status: 'resolved' });
      onCreate();
  }
  
  const handleRecord = () => {
      onUpdate({ action: 'record', status: 'resolved' });
      onRecord();
  }
  
  const handleApi = () => {
    onUpdate({ action: 'api', status: 'resolved' });
    onApi();
  }

  const renderActionButtons = () => {
    if (mapping.status === 'resolved') {
        return (
            <div className="flex items-center gap-2 text-green-600 font-medium">
                <Check className="h-5 w-5"/>
                <span>{mapping.action === 'reuse' ? 'Reused' : mapping.action === 'create' ? 'Created' : mapping.action === 'api' ? 'API Step' : 'Recorded'}</span>
            </div>
        )
    }

    return (
      <div className="flex gap-2">
        <ReuseKeywordPopover keyword={mapping.suggestion || existingKeywords[0]} onConfirm={handleReuse}>
            <Button className="relative overflow-hidden" variant="outline" onClick={handleRipple}>Reuse</Button>
        </ReuseKeywordPopover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Button className="relative overflow-hidden" variant="default" onClick={handleRipple}>
                Create <ChevronDown className="h-4 w-4 ml-2"/>
             </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleCreate}>
              <Code className="h-4 w-4 mr-2"/>
              <span>Create Manually</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRecord}>
              <Video className="h-4 w-4 mr-2"/>
              <span>Record UI</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleApi}>
              <Server className="h-4 w-4 mr-2"/>
              <span>API Request</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <Card 
        ref={cardRef} 
        className={cn(
            "p-4 grid grid-cols-[1fr_auto] items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-subtle hover:-translate-y-0.5",
            isReused && 'animate-glow-border-green'
        )}
    >
      <div className="grid grid-cols-[1fr_1.5fr] items-center gap-4">
        {/* Gherkin Step */}
        <div className="font-medium text-sm pr-4 border-r">
          {mapping.gherkinStep}
        </div>
        
        {/* Suggestion */}
        <div>
            {mapping.suggestion ? (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <SimilarityBadge similarity={mapping.similarity}/>
                        <p className="font-semibold text-sm truncate">{mapping.suggestion.stepText}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="h-3 w-3"/>
                        <p className="truncate font-mono">{mapping.suggestion.filePath}</p>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                    <Info className="h-4 w-4"/>
                    No suggestion found. Choose a "Create" action.
                </div>
            )}
        </div>
      </div>

      {/* Actions */}
      <div className="justify-self-end">
        {renderActionButtons()}
      </div>
    </Card>
  );
};
