
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Code, Paperclip, Volume2, VolumeX, Check } from "lucide-react";
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

export interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  imageUrl?: string;
  code?: string;
}

interface ChatMessageProps {
  message: Message;
  onReviewCode?: (code: string) => void;
}

const UserMessageContent = ({ text }: { text: string }) => {
  const attachmentRegex = /\[ATTACHMENT: (.*?)\]\n([\s\S]*?)\n\[\/ATTACHMENT\]\n\n([\s\S]*)/s;
  const match = text.match(attachmentRegex);
  if (!match) return <p className="leading-relaxed whitespace-pre-wrap break-words">{text}</p>;
  const [, fileName, fileContent, userPrompt] = match;
  return (
    <div className="space-y-3">
      {userPrompt && <p className="leading-relaxed whitespace-pre-wrap break-words">{userPrompt}</p>}
      <Accordion type="single" collapsible className="w-full bg-foreground/5 rounded-xl border border-foreground/10">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="p-3 hover:no-underline gap-2 text-xs font-medium opacity-80">
            <Paperclip className="h-3 w-3" />
            <span>{fileName}</span>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words opacity-70 max-h-40 overflow-y-auto">{fileContent}</pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const ChatMessage = ({ message, onReviewCode }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
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
    h1: ({node, ...props}: any) => <h1 className="text-xl font-semibold mt-6 mb-3 text-foreground tracking-tight" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-lg font-semibold mt-5 mb-2 text-foreground tracking-tight" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-3 last:mb-0 break-words text-foreground/90 leading-[1.7]" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc mb-3 pl-5 text-foreground/90 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal mb-3 pl-5 text-foreground/90 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className="text-foreground/90 leading-relaxed" {...props} />,
    a: ({node, ...props}: any) => <a className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-2 border-primary/30 pl-4 my-4 text-muted-foreground italic" {...props} />,
    code({node, inline, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '')
      if (inline) return <code className="bg-muted text-primary/80 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>{children}</code>
      return (
        <div className="my-4 rounded-xl overflow-hidden border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{match ? match[1] : 'code'}</span>
            <button 
              onClick={() => { navigator.clipboard.writeText(String(children).replace(/\n$/, '')); toast.success("Copied"); }}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <SyntaxHighlighter 
            style={oneLight} 
            language={match ? match[1] : undefined} 
            PreTag="div" 
            customStyle={{ margin: 0, background: 'transparent', fontSize: '13px', lineHeight: '1.6' }} 
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
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center mt-0.5">
          <Bot size={14} className="text-primary" />
        </div>
      )}
      <div className={cn("flex flex-col max-w-[85%] min-w-0", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "text-[15px] leading-[1.7] relative",
          isUser
            ? "bg-foreground text-background px-4 py-3 rounded-2xl rounded-br-md"
            : "text-foreground"
        )}>
          {isUser ? (
            message.parts.map((part, index) => <UserMessageContent key={index} text={part.text} />)
          ) : (
            <div className="prose-sm max-w-none">
              <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>{messageText}</ReactMarkdown>
            </div>
          )}
          {message.imageUrl && (
            <div className={cn("mt-3 rounded-xl overflow-hidden", isUser ? "bg-background/10" : "bg-muted")}>
              <img src={message.imageUrl} alt="Content" className="w-full h-auto max-w-md rounded-xl" style={{ maxHeight: '400px', objectFit: 'contain' }} />
            </div>
          )}
          {!isUser && message.code && onReviewCode && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => onReviewCode(message.code!)} className="text-xs h-8 rounded-lg border-border text-muted-foreground hover:text-primary hover:border-primary/30">
                <Code className="mr-1.5 h-3 w-3" /> Review in Canvas
              </Button>
            </div>
          )}
        </div>
        
        {/* Actions */}
        {!isUser && (
          <div className="flex gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={handleCopy} className="p-1.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60 transition-all" aria-label="Copy">
              {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
            </button>
            <button onClick={handleSpeak} className="p-1.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60 transition-all" aria-label="Speak">
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground/8 flex items-center justify-center mt-0.5">
          <User size={13} className="text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
