
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, Mic, Code2, Sparkles, MicOff, ArrowUp, ChevronDown, Cpu } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { FileUploadResult, uploadService } from '@/services/uploadService';
import VoiceRecorder from './VoiceRecorder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export type GeminiModel = {
  id: string;
  label: string;
  description: string;
  badge?: string;
};

export const GEMINI_MODELS: GeminiModel[] = [
  { id: 'gemini-2.5-flash-preview-05-20', label: 'Gemini 2.5 Flash', description: 'Fast & balanced', badge: 'Default' },
  { id: 'gemini-2.5-pro-preview-05-06', label: 'Gemini 2.5 Pro', description: 'Best reasoning & quality' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Previous gen, fast' },
];

interface EnhancedChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  isCoderMode: boolean;
  setIsCoderMode: (mode: boolean) => void;
  isDeepSearchMode: boolean;
  setIsDeepSearchMode: (mode: boolean) => void;
  onSubmit: (e: React.FormEvent, attachments?: FileUploadResult[]) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const EnhancedChatInput = ({
  input, setInput, isLoading, isCoderMode, setIsCoderMode, isDeepSearchMode, setIsDeepSearchMode, onSubmit, selectedModel, setSelectedModel
}: EnhancedChatInputProps) => {
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileUploadResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const currentModel = GEMINI_MODELS.find(m => m.id === selectedModel) || GEMINI_MODELS[0];

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
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
        if (result.success) { setAttachedFiles(prev => [...prev, result]); toast.success(`Attached "${file.name}"`); }
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

  const canSend = (input.trim() || attachedFiles.length > 0) && !isLoading;

  return (
    <div className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3 pb-4">
        
        {/* Mode toggles + Model selector */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border border-border hover:border-primary/20 hover:text-foreground bg-card text-muted-foreground">
                <Cpu className="w-3 h-3" />
                {currentModel.label}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Select Model</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {GEMINI_MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 py-2.5 cursor-pointer",
                    selectedModel === model.id && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn("text-sm font-medium", selectedModel === model.id ? "text-primary" : "text-foreground")}>
                      {model.label}
                    </span>
                    {model.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{model.badge}</span>
                    )}
                    {selectedModel === model.id && (
                      <span className="ml-auto text-primary text-xs">✓</span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{model.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setIsCoderMode(!isCoderMode)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
              isCoderMode 
                ? "bg-primary/8 text-primary border-primary/20" 
                : "bg-transparent text-muted-foreground border-border hover:border-primary/20 hover:text-foreground"
            )}
          >
            <Code2 className="w-3 h-3" />
            Developer
          </button>
          <button
            onClick={() => setIsDeepSearchMode(!isDeepSearchMode)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
              isDeepSearchMode 
                ? "bg-accent/8 text-accent border-accent/20" 
                : "bg-transparent text-muted-foreground border-border hover:border-accent/20 hover:text-foreground"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Deep Search
          </button>
        </div>

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="inline-flex items-center gap-2 bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs">
                <Paperclip className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground truncate max-w-32">{file.name}</span>
                <button onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSubmit}>
          <div className={cn(
            "relative flex items-end rounded-2xl border bg-card transition-all duration-200",
            isFocused ? "border-primary/30 shadow-[0_0_0_3px_hsl(168_80%_38%/0.06)]" : "border-border hover:border-border"
          )}>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[44px] max-h-[180px] leading-relaxed px-4 py-3 text-[15px]"
              rows={1}
            />
            <div className="flex items-center gap-0.5 pr-2 pb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 rounded-lg text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/60 transition-all disabled:opacity-40"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                disabled={isLoading}
                className={cn(
                  "p-2 rounded-lg transition-all disabled:opacity-40",
                  isRecording 
                    ? "text-destructive bg-destructive/8" 
                    : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/60"
                )}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={!canSend}
                className={cn(
                  "p-2 rounded-xl transition-all duration-200 ml-0.5",
                  canSend 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
                    : "bg-muted text-muted-foreground/40"
                )}
              >
                {isLoading 
                  ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  : <ArrowUp className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
        </form>

        {isRecording && (
          <div className="mt-2">
            <VoiceRecorder onResult={(t) => { setInput(input + (input ? ' ' : '') + t); setIsRecording(false); }} onStop={() => setIsRecording(false)} />
          </div>
        )}

        <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.css,.html,.pdf,.doc,.docx" />
        
        <p className="text-[11px] text-muted-foreground/50 text-center mt-2.5">
          AdiGon AI · {currentModel.label} · Can make mistakes
        </p>
      </div>
    </div>
  );
};

export default EnhancedChatInput;
