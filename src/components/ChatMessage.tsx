
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User, Copy, Code, Paperclip, Volume2, VolumeX, Check, ThumbsUp, ThumbsDown, RefreshCw, Pencil } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import adigonLogo from '@/assets/adigon-logo.png';

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  imageUrl?: string;
  code?: string;
}

interface ChatMessageProps {
  message: Message;
  onReviewCode?: (code: string) => void;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEditMessage?: (newText: string) => void;
  isLastUserMessage?: boolean;
  isLastModelMessage?: boolean;
}

const UserMessageContent = ({ text }: { text: string }) => {
  const attachmentRegex = /\[ATTACHMENT: (.*?)\]\n([\s\S]*?)\n\[\/ATTACHMENT\]\n\n([\s\S]*)/s;
  const match = text.match(attachmentRegex);
  if (!match) return <p className="leading-relaxed whitespace-pre-wrap break-words">{text}</p>;
  const [, fileName, fileContent, userPrompt] = match;
  return (
    <div className="space-y-3">
      {userPrompt && <p className="leading-relaxed whitespace-pre-wrap break-words">{userPrompt}</p>}
      <Accordion type="single" collapsible className="w-full bg-primary-foreground/10 rounded-xl border border-primary-foreground/15">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="p-3 hover:no-underline gap-2 text-xs font-medium opacity-90">
            <Paperclip className="h-3 w-3" />
            <span>{fileName}</span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words opacity-75 max-h-40 overflow-y-auto">{fileContent}</pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const StreamingCursor = () => (
  <span className="inline-block w-[2px] h-[1.1em] bg-primary ml-0.5 align-middle animate-pulse" />
);

const ChatMessage = ({ message, onReviewCode, isStreaming = false, onRegenerate, onEditMessage, isLastUserMessage = false, isLastModelMessage = false }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const messageText = message.parts.map((part) => part.text).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied");
  };
  
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) { toast.error("Not supported"); return; }
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(messageText);
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google US English') || v.name.includes('Samantha')));
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) { window.speechSynthesis.getVoices(); }
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-xl font-bold mt-6 mb-3 text-foreground tracking-tight" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-lg font-bold mt-5 mb-2.5 text-foreground tracking-tight" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-3 last:mb-0 break-words text-foreground/80 leading-[1.8]" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc mb-3 pl-5 text-foreground/80 space-y-1.5" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal mb-3 pl-5 text-foreground/80 space-y-1.5" {...props} />,
    li: ({node, ...props}: any) => <li className="text-foreground/80 leading-relaxed" {...props} />,
    a: ({node, ...props}: any) => <a className="text-primary font-medium underline underline-offset-2 decoration-primary/25 hover:decoration-primary/60 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-2 border-primary/15 pl-4 my-4 text-muted-foreground italic" {...props} />,
    hr: ({node, ...props}: any) => <hr className="my-6 border-border/40" {...props} />,
    table: ({node, ...props}: any) => (
      <div className="my-4 overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    thead: ({node, ...props}: any) => <thead className="bg-muted/40 border-b border-border/60" {...props} />,
    th: ({node, ...props}: any) => <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs uppercase tracking-wider" {...props} />,
    td: ({node, ...props}: any) => <td className="px-4 py-2.5 border-b border-border/30 text-foreground/75" {...props} />,
    code({node, inline, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '')
      if (inline) return <code className="bg-primary/[0.05] text-primary/85 px-1.5 py-0.5 rounded-md text-[13px] font-mono font-medium" {...props}>{children}</code>
      return (
        <div className="my-4 rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive/25" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/25" />
                <div className="w-2 h-2 rounded-full bg-primary/25" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">{match ? match[1] : 'code'}</span>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(String(children).replace(/\n$/, '')); toast.success("Copied"); }}
              className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-muted/50 font-medium"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <SyntaxHighlighter 
            style={oneLight} 
            language={match ? match[1] : undefined} 
            PreTag="div" 
            customStyle={{ margin: 0, background: 'transparent', fontSize: '13px', lineHeight: '1.7', padding: '16px' }} 
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      )
    }
  };

  return (
    <div className={cn("group flex items-start gap-3 py-5", isUser && "justify-end")}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/[0.06] flex items-center justify-center mt-0.5 ring-1 ring-primary/8">
          <img src={adigonLogo} alt="" className="w-4 h-4" />
        </div>
      )}
      <div className={cn("flex flex-col max-w-[85%] min-w-0", isUser ? "items-end" : "items-start")}>
        {/* Label */}
        <span className={cn("text-[10px] font-semibold mb-1.5 tracking-wide uppercase", isUser ? "text-muted-foreground/40" : "text-primary/50")}>
          {isUser ? 'You' : 'AdiGon AI'}
        </span>
        
        <div className={cn(
          "text-[15px] leading-[1.8] relative",
          isUser
            ? "bg-foreground text-background px-4 py-3 rounded-2xl rounded-br-sm shadow-sm"
            : "text-foreground"
        )}>
          {isUser ? (
            isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full min-h-[60px] bg-background text-foreground rounded-xl p-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-7 text-xs rounded-lg">Cancel</Button>
                  <Button size="sm" onClick={() => { if (onEditMessage && editText.trim()) { onEditMessage(editText.trim()); setIsEditing(false); } }} className="h-7 text-xs rounded-lg">Send</Button>
                </div>
              </div>
            ) : (
              message.parts.map((part, index) => <UserMessageContent key={index} text={part.text} />)
            )
          ) : (
            <div className="prose-sm max-w-none">
              <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>{messageText}</ReactMarkdown>
              {isStreaming && <StreamingCursor />}
            </div>
          )}
          {message.imageUrl && (
            <div className={cn("mt-3 rounded-xl overflow-hidden", isUser ? "bg-background/10" : "bg-muted/50")}>
              <img src={message.imageUrl} alt="Content" className="w-full h-auto max-w-md rounded-xl" style={{ maxHeight: '400px', objectFit: 'contain' }} />
            </div>
          )}
          {!isUser && !isStreaming && message.code && onReviewCode && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => onReviewCode(message.code!)} className="text-xs h-8 rounded-xl border-border/50 text-muted-foreground hover:text-primary hover:border-primary/20 gap-1.5 transition-all">
                <Code className="h-3 w-3" /> Open in Canvas
              </Button>
            </div>
          )}
        </div>
        
        {/* AI Actions: copy, speak, feedback, regenerate */}
        {!isUser && !isStreaming && messageText && (
          <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button onClick={handleCopy} className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-muted/50 transition-all" aria-label="Copy">
              {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
            </button>
            <button onClick={handleSpeak} className={cn("p-1.5 rounded-lg transition-all", isSpeaking ? "text-primary bg-primary/5" : "text-muted-foreground/30 hover:text-foreground hover:bg-muted/50")} aria-label="Speak">
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <div className="w-px h-3 bg-border/30 mx-1" />
            <button
              onClick={() => { setFeedback(f => f === 'up' ? null : 'up'); toast.success('Thanks for the feedback!'); }}
              className={cn("p-1.5 rounded-lg transition-all", feedback === 'up' ? "text-primary bg-primary/10" : "text-muted-foreground/30 hover:text-foreground hover:bg-muted/50")}
              aria-label="Thumbs up"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => { setFeedback(f => f === 'down' ? null : 'down'); toast.success('Thanks for the feedback!'); }}
              className={cn("p-1.5 rounded-lg transition-all", feedback === 'down' ? "text-destructive bg-destructive/10" : "text-muted-foreground/30 hover:text-foreground hover:bg-muted/50")}
              aria-label="Thumbs down"
            >
              <ThumbsDown size={13} />
            </button>
            {isLastModelMessage && onRegenerate && (
              <>
                <div className="w-px h-3 bg-border/30 mx-1" />
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-muted/50 transition-all"
                  aria-label="Regenerate"
                >
                  <RefreshCw size={13} />
                </button>
              </>
            )}
          </div>
        )}

        {/* User edit action */}
        {isUser && !isEditing && isLastUserMessage && onEditMessage && (
          <div className="flex gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={() => { setEditText(messageText); setIsEditing(true); }}
              className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Edit message"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-foreground/[0.05] flex items-center justify-center mt-0.5 ring-1 ring-foreground/6">
          <User size={13} className="text-muted-foreground/70" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
