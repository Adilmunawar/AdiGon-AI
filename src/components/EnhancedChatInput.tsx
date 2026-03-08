
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Mic, Code2, Sparkles, MicOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { FileUploadResult, uploadService } from '@/services/uploadService';
import VoiceRecorder from './VoiceRecorder';

interface EnhancedChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  isCoderMode: boolean;
  setIsCoderMode: (mode: boolean) => void;
  isDeepSearchMode: boolean;
  setIsDeepSearchMode: (mode: boolean) => void;
  onSubmit: (e: React.FormEvent, attachments?: FileUploadResult[]) => void;
}

const EnhancedChatInput = ({
  input, setInput, isLoading, isCoderMode, setIsCoderMode, isDeepSearchMode, setIsDeepSearchMode, onSubmit
}: EnhancedChatInputProps) => {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileUploadResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => { adjustTextareaHeight(); }, [input, adjustTextareaHeight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) { e.preventDefault(); handleSubmit(e as any); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachedFiles.length > 0) && !isLoading) { onSubmit(e, attachedFiles); setAttachedFiles([]); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const result = await uploadService.processFile(file);
        if (result.success) { setAttachedFiles(prev => [...prev, result]); toast.success(`File "${file.name}" attached!`); }
        else toast.error(`Failed: ${result.error}`);
      } catch { toast.error(`Failed to attach "${file.name}"`); }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) { handleFileChange({ target: { files: [file] } } as any); e.preventDefault(); return; }
        }
      }
    }
  };

  return (
    <div className="relative border-t border-border bg-background">
      <div className="relative container mx-auto px-4 py-4 max-w-4xl">
        {/* Mode Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Switch checked={isCoderMode} onCheckedChange={setIsCoderMode} className="data-[state=checked]:bg-primary" />
            <Badge variant={isCoderMode ? "default" : "secondary"} className={cn("gap-1.5 px-3 py-1 text-xs font-medium transition-all", isCoderMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
              <Code2 className="w-3 h-3" /> Developer Mode
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isDeepSearchMode} onCheckedChange={setIsDeepSearchMode} className="data-[state=checked]:bg-accent" />
            <Badge variant={isDeepSearchMode ? "default" : "secondary"} className={cn("gap-1.5 px-3 py-1 text-xs font-medium transition-all", isDeepSearchMode ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}>
              <Sparkles className="w-3 h-3" /> Deep Search
            </Badge>
          </div>
        </div>

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="inline-flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2 text-sm">
                <Paperclip className="w-4 h-4 text-primary" />
                <span className="text-foreground truncate max-w-32">{file.name}</span>
                <Button variant="ghost" size="icon" onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))} className="h-6 w-6 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className={cn(
            "relative flex items-end gap-2 bg-card border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden",
            isFocused ? "border-primary shadow-md" : "border-border hover:border-muted-foreground/30"
          )}>
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                placeholder="Message AdiGon AI..."
                disabled={isLoading}
                className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[48px] max-h-[120px] leading-relaxed px-4 py-3 text-sm"
                rows={1}
              />
            </div>
            <div className="flex items-center gap-1 pr-2 pb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" disabled={isLoading}>
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" onClick={() => setIsRecording(!isRecording)} className={cn("h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground", isRecording && "text-destructive hover:text-destructive")} disabled={isLoading}>
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice input</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button type="submit" size="icon" disabled={(!input.trim() && attachedFiles.length === 0) || isLoading} className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-sm disabled:opacity-50 ml-1">
                {isLoading ? <div className="w-3 h-3 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </form>

        {isRecording && (
          <div className="mt-3">
            <VoiceRecorder onResult={(t) => { setInput(input + (input ? ' ' : '') + t); setIsRecording(false); }} onStop={() => setIsRecording(false)} />
          </div>
        )}

        <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.css,.html,.pdf,.doc,.docx" />
      </div>
    </div>
  );
};

export default EnhancedChatInput;
