
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wand, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AiRefinementModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    originalCode: string;
    onApply: (newCode: string) => void;
}

const refinedCodeSuggestion = `
package com.example.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;

/**
 * Represents the Login Page and its elements.
 * Provides methods to interact with the page.
 */
public class LoginPage {

    private WebDriverWait wait;

    @FindBy(name = "username")
    private WebElement usernameInput;

    @FindBy(name = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[data-testid='login-submit']") // More stable selector
    private WebElement loginButton;

    public LoginPage(WebDriver driver) {
        PageFactory.initElements(driver, this);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10)); // Added explicit wait
    }

    /**
     * Enters the given username into the username field.
     * @param username The username to enter.
     */
    public void enterUsername(String username) {
        wait.until(ExpectedConditions.visibilityOf(usernameInput)).sendKeys(username);
    }

    /**
     * Enters the given password into the password field.
     * @param password The password to enter.
     */
    public void enterPassword(String password) {
        wait.until(ExpectedConditions.visibilityOf(passwordInput)).sendKeys(password);
    }

    /**
     * Clicks the login button.
     */
    public void clickLogin() {
        wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
    }
}
`;

export function AiRefinementModal({ isOpen, setIsOpen, originalCode, onApply }: AiRefinementModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setShowSuggestion(false);
            const timer = setTimeout(() => {
                setIsLoading(false);
                setShowSuggestion(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleApply = () => {
        onApply(refinedCodeSuggestion);
        toast({
            title: "AI Suggestion Applied",
            description: "The code has been updated with the AI's refinement.",
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        AI Code Refinement
                    </DialogTitle>
                    <DialogDescription>
                        The AI has analyzed your code and suggests the following improvements for stability and readability.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-grow grid grid-cols-2 gap-4 overflow-hidden">
                    {/* Before */}
                    <div className="flex flex-col">
                        <h3 className="font-semibold mb-2">Original Code</h3>
                        <div className="flex-grow rounded-lg border bg-muted/20 overflow-auto font-mono text-xs">
                             <pre className="p-4">{originalCode}</pre>
                        </div>
                    </div>
                    {/* After */}
                    <div className="flex flex-col">
                        <h3 className="font-semibold mb-2 flex items-center justify-between">
                            <span>AI Suggested Code</span>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-800">Readability: +15</Badge>
                                <Badge variant="secondary" className="bg-sky-100 text-sky-800">Stability: +22</Badge>
                            </div>
                        </h3>
                        <div className="flex-grow rounded-lg border border-amber-300 bg-amber-50/20 overflow-auto font-mono text-xs relative">
                            <AnimatePresence>
                                {isLoading ? (
                                     <motion.div 
                                        key="loader"
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10"
                                    >
                                        <Wand className="h-10 w-10 text-primary animate-pulse"/>
                                        <p className="mt-4 font-medium">Analyzing code...</p>
                                        <p className="text-sm text-muted-foreground">Checking for improvements in selectors, waits, and comments.</p>
                                     </motion.div>
                                ) : (
                                    <motion.div 
                                        key="code"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full"
                                    >
                                        <pre className="p-4 h-full overflow-auto">{refinedCodeSuggestion}</pre>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Reject
                    </Button>
                    <Button onClick={handleApply} disabled={isLoading}>Apply Suggestion</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
