import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Code, Paperclip, Speaker, VolumeX } from "lucide-react";
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
  if (!match) return <p className="leading-relaxed whitespace-pre-wrap break-words text-primary-foreground">{text}</p>;
  const [, fileName, fileContent, userPrompt] = match;
  return (
    <div className="space-y-3">
      {userPrompt && <p className="leading-relaxed whitespace-pre-wrap break-words text-primary-foreground">{userPrompt}</p>}
      <Accordion type="single" collapsible className="w-full bg-primary-foreground/10 rounded-2xl border border-primary-foreground/20">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="p-4 hover:no-underline justify-start gap-3 text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            <div className="p-2 bg-primary-foreground/10 rounded-lg"><Paperclip className="h-4 w-4" /></div>
            <span>Attachment: {fileName}</span>
          </AccordionTrigger>
          <AccordionContent className="pt-0 px-4 pb-4">
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl max-h-60 overflow-y-auto mt-1">
              <pre className="text-xs font-mono p-4 whitespace-pre-wrap break-words text-primary-foreground/80">{fileContent}</pre>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const ChatMessage = ({ message, onReviewCode }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messageText = message.parts.map((part) => part.text).join("\n");

  const handleCopy = () => { if (messageText) { navigator.clipboard.writeText(messageText); toast.success("Copied to clipboard!"); } };
  
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) { toast.error("Text-to-speech not supported."); return; }
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(messageText);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.includes('Zira') || v.name.includes('Susan') || v.name.includes('Google US English') || v.name.includes('Samantha')));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => { toast.error("Couldn't play audio."); setIsSpeaking(false); };
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if ('speechSynthesis' in window) { window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices(); window.speechSynthesis.getVoices(); }
    return () => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); window.speechSynthesis.onvoiceschanged = null; } };
  }, []);

  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold my-4 text-foreground" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-semibold my-3 text-foreground" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold my-2 text-foreground" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-4 last:mb-0 break-words text-foreground leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-inside mb-4 pl-4 text-foreground" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-inside mb-4 pl-4 text-foreground" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-2 text-foreground" {...props} />,
    a: ({node, ...props}: any) => <a className="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-primary/40 pl-4 my-4 italic text-muted-foreground bg-muted/50 py-2 rounded-r-lg" {...props} />,
    code({node, inline, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '')
      if (inline) return <code className="bg-muted text-primary px-2 py-1 rounded-lg text-sm font-mono break-words border border-border" {...props}>{children}</code>
      return (
        <div className="my-6 rounded-2xl overflow-hidden border border-border shadow-sm">
          <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-medium">{match ? match[1] : 'code'}</span>
            <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))} className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
          </div>
          <SyntaxHighlighter style={oneLight} language={match ? match[1] : undefined} PreTag="div" customStyle={{ margin: 0, maxWidth: '100%', overflow: 'auto', background: 'hsl(160, 20%, 97%)', fontSize: '14px' }} {...props}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      )
    }
  };

  return (
    <div className={cn("group flex animate-fade-in-up items-start gap-4 py-6 max-w-none", isUser && "justify-end")}>
      {!isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
          <Bot size={24} />
        </div>
      )}
      <div className={cn("flex flex-col w-full max-w-4xl", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "px-6 py-4 text-base shadow-sm transition-all duration-300 border max-w-full relative overflow-hidden",
          isUser
            ? "bg-primary text-primary-foreground border-primary/20 rounded-t-3xl rounded-bl-3xl"
            : "bg-card text-card-foreground border-border rounded-t-3xl rounded-br-3xl"
        )}>
          {isUser ? (
            message.parts.map((part, index) => <UserMessageContent key={index} text={part.text} />)
          ) : (
            <div className="overflow-hidden relative">
              <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>{messageText}</ReactMarkdown>
            </div>
          )}
          {message.imageUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden bg-muted p-3 border border-border">
              <img src={message.imageUrl} alt="Generated content" className="w-full h-auto max-w-full rounded-xl shadow-sm" style={{ maxHeight: '500px', objectFit: 'contain' }} />
            </div>
          )}
          {!isUser && message.code && onReviewCode && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => onReviewCode(message.code!)} className="w-full bg-muted border-border text-foreground hover:bg-primary/5 hover:text-primary transition-all duration-200">
                <Code className="mr-2 h-4 w-4" /> Review Code
              </Button>
            </div>
          )}
        </div>
        {!isUser && (
          <div className="flex gap-2 mt-3 self-start opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button onClick={handleCopy} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200" aria-label="Copy message">
              <Copy size={16} />
            </button>
            <button onClick={handleSpeak} className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200" aria-label={isSpeaking ? "Stop speaking" : "Speak message"}>
              {isSpeaking ? <VolumeX size={16} /> : <Speaker size={16} />}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-sm">
          <User size={24} className="text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
