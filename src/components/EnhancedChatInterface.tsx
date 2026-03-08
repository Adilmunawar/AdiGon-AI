
import React from 'react';
import { Bot, LoaderCircle, ArrowDown, Sparkles, Code, Brain, Search, MessageSquare, Cpu } from 'lucide-react';
import ChatMessage, { Message } from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import adigonLogo from '@/assets/adigon-logo.png';

interface EnhancedChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming?: boolean;
  loadingMessage: string;
  examplePrompts: Array<{ text: string; icon: any }>;
  handleSendMessage: (prompt: string) => void;
  onReviewCode: (code: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  showScrollButton: boolean;
  scrollToBottom: () => void;
}

const EnhancedChatInterface = ({
  messages,
  isLoading,
  isStreaming = false,
  loadingMessage,
  examplePrompts,
  handleSendMessage,
  onReviewCode,
  messagesEndRef,
  showScrollButton,
  scrollToBottom
}: EnhancedChatInterfaceProps) => {
  const isMobile = useIsMobile();

  return (
    <main className="flex-1 overflow-y-auto relative bg-background">
      {/* Subtle ambient gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className={`relative mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isMobile ? 'max-w-full' : 'max-w-3xl'}`}>
        
        {/* Messages */}
        <div className="space-y-1">
          {messages.map((msg, index) => {
            const isLastModel = msg.role === 'model' && index === messages.length - 1;
            return (
              <div 
                key={index} 
                className="animate-fade-in-up" 
                style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
              >
                <ChatMessage 
                  message={msg} 
                  onReviewCode={onReviewCode} 
                  isStreaming={isLastModel && isStreaming}
                />
              </div>
            );
          })}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 py-6 animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
              <Bot size={16} className="text-primary" />
            </div>
            <div className="flex items-center gap-3 pt-1.5">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'typing-dot 1.4s ease-in-out infinite' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'typing-dot 1.4s ease-in-out 0.2s infinite' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'typing-dot 1.4s ease-in-out 0.4s infinite' }} />
              </div>
              <span className="text-sm text-muted-foreground font-medium">{loadingMessage}</span>
            </div>
          </div>
        )}

        {/* Empty state — Premium welcome */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[65vh] animate-fade-in-up">
            {/* Animated logo glow */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150 animate-pulse-soft" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 flex items-center justify-center shadow-lg animate-float">
                <img src={adigonLogo} alt="" className="w-9 h-9" />
              </div>
            </div>

            {/* Hero text */}
            <div className="text-center mb-10 max-w-lg">
              <h1 className={`font-bold tracking-tight text-foreground mb-3 ${isMobile ? 'text-2xl' : 'text-[32px]'}`}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                How can I help you today? Ask me to code, research, create, or explore anything.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className={`grid gap-2.5 w-full max-w-2xl ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {examplePrompts.slice(0, 4).map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button 
                    key={prompt.text}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="group flex items-center gap-3.5 p-4 rounded-2xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-md hover:shadow-primary/[0.03] transition-all duration-300 text-left animate-fade-in-up"
                    style={{ animationDelay: `${200 + index * 80}ms` }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/[0.06] flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                      <Icon size={16} className="text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2 font-medium">
                      {prompt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Capabilities row */}
            <div className="flex items-center gap-4 mt-10 text-[11px] text-muted-foreground/50">
              <div className="flex items-center gap-1.5">
                <Code size={11} />
                <span>Code</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Search size={11} />
                <span>Research</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Brain size={11} />
                <span>Analyze</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} />
                <span>Create</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Scroll to bottom */}
      {showScrollButton && (
        <div className="sticky bottom-4 flex justify-center pointer-events-none">
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="outline"
            className="pointer-events-auto h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm border-border/60 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all animate-fade-in"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={14} />
          </Button>
        </div>
      )}
    </main>
  );
};

export default EnhancedChatInterface;
