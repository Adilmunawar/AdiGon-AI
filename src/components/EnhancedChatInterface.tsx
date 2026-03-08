
import React from 'react';
import { Bot, LoaderCircle, ArrowDown, Sparkles, Code, Brain, Search, MessageSquare } from 'lucide-react';
import ChatMessage, { Message } from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <main className="flex-1 overflow-y-auto relative">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isMobile ? 'max-w-full' : 'max-w-3xl'}`}>
        
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
            <div className="flex items-center gap-3 pt-1">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" style={{ animation: 'typing-dot 1.4s ease-in-out infinite' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" style={{ animation: 'typing-dot 1.4s ease-in-out 0.2s infinite' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" style={{ animation: 'typing-dot 1.4s ease-in-out 0.4s infinite' }} />
              </div>
              <span className="text-sm text-muted-foreground">{loadingMessage}</span>
            </div>
          </div>
        )}

        {/* Empty state / Welcome */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            {/* Hero */}
            <div className="text-center mb-12 max-w-lg">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/8 mb-6">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h1 className={`font-semibold tracking-tight text-foreground mb-3 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                What can I help with?
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Ask me anything — code, research, creative ideas, or just a conversation.
              </p>
            </div>

            {/* Prompt suggestions */}
            <div className={`grid gap-2.5 w-full max-w-2xl ${
              isMobile ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {examplePrompts.slice(0, 4).map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button 
                    key={prompt.text}
                    onClick={() => handleSendMessage(prompt.text)}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-border bg-background hover:bg-card hover:border-primary/20 transition-all duration-200 text-left animate-fade-in-up"
                    style={{ animationDelay: `${150 + index * 75}ms` }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Icon size={15} className="text-primary/70 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug line-clamp-2">
                      {prompt.text}
                    </span>
                  </button>
                );
              })}
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
            className="pointer-events-auto h-8 w-8 rounded-full bg-background/90 backdrop-blur border-border shadow-lg hover:shadow-xl transition-all animate-fade-in"
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
