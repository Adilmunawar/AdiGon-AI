
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Code, MessageSquare, Search, Sparkles, Zap, Cpu, Download, FileText } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import EnhancedChatInput from '@/components/EnhancedChatInput';
import AdvancedDeveloperCanvas from '@/components/AdvancedDeveloperCanvas';
import { Message } from '@/components/ChatMessage';
import { useQuery } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { geminiService } from '@/services/geminiService';
import { Button } from '@/components/ui/button';
import { FileUploadResult } from '@/services/uploadService';
import { GeneratedCode } from '@/services/advancedCodeGenerator';
import { parseContent } from '@/components/CodeBlock';
import adigonLogo from '@/assets/adigon-logo.png';
import { exportAsMarkdown, exportAsPDF } from '@/utils/exportConversation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const loadingMessages = [
  "Thinking...",
  "Processing your request...",
  "Analyzing...",
  "Generating response...",
  "Almost there...",
];

const examplePrompts = [
  { text: "Build a complete Instagram clone with auth", icon: Code },
  { text: "Create an analytics dashboard", icon: Cpu },
  { text: "Develop a real-time chat app", icon: MessageSquare },
  { text: "Research latest AI trends", icon: Search },
];

const Index = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [conversations, setConversations] = useState<{id: string, title: string}[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [isDeepSearchMode, setIsDeepSearchMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-preview-05-20');
  const [isAdvancedCanvasOpen, setIsAdvancedCanvasOpen] = useState(false);
  const [canvasInitialCode, setCanvasInitialCode] = useState('');
  const [canvasInitialFiles, setCanvasInitialFiles] = useState<GeneratedCode[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: userProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const loadConversations = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase.from('conversations').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) { toast.error("Failed to load conversations"); return; }
      setConversations(data || []);
    } catch { toast.error("Failed to load conversations"); }
  };

  useEffect(() => { if (user) loadConversations(); }, [user]);

  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    try {
      const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
      if (error) { toast.error("Failed to load conversation"); return; }
      setMessages(data.map((msg: any) => ({ role: msg.role, parts: msg.parts, ...(msg.image_url && { imageUrl: msg.image_url }) })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { toast.error("Failed to load conversation"); }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase.from('conversations').delete().eq('id', conversationId).eq('user_id', user?.id);
      if (error) { toast.error("Failed to delete"); return; }
      if (activeConversationId === conversationId) { setActiveConversationId(null); setMessages([]); }
      await loadConversations();
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target) {
        const { scrollTop, scrollHeight, clientHeight } = target;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100 && messages.length > 2);
      }
    };
    const chatContainer = document.querySelector('main');
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages.length]);

  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  const extractCodeFromResponse = (responseText: string): GeneratedCode[] => {
    const parsedFiles = parseContent(responseText);
    return parsedFiles.filter(file => file.path !== 'SYSTEM_MESSAGE').map(file => ({ fileName: file.path, content: file.code, language: file.language, errors: [] }));
  };

  const handleSendMessage = async (messageText: string, attachments?: FileUploadResult[]) => {
    if ((!messageText.trim() && (!attachments || attachments.length === 0)) || isLoading) return;
    const currentMessages = [...messages];
    let enhancedMessage = messageText;
    let imageUrl = null;
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type === 'image' && attachment.url) imageUrl = attachment.url;
        else if (attachment.type === 'document' || attachment.type === 'audio') enhancedMessage = `[ATTACHMENT: ${attachment.name}]\n${enhancedMessage}`;
      }
    }
    const userMessage: Message = { role: "user" as const, parts: [{ text: enhancedMessage }], ...(imageUrl && { imageUrl }) };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[messageIndex]);
    const loadingInterval = setInterval(() => { messageIndex = (messageIndex + 1) % loadingMessages.length; setLoadingMessage(loadingMessages[messageIndex]); }, 2500);

    try {
      let systemPrompt = "You are AdiGon AI, a sophisticated and highly advanced AI assistant.";
      if (isCoderMode) {
        systemPrompt += ` You are in Advanced Developer Mode. Generate complete, enterprise-grade applications with multiple files.
IMPORTANT: When generating code, use this format:
FILE: path/to/file.extension
\`\`\`language
// Complete code here
\`\`\`
Always provide fully functional implementations.`;
      }
      if (isDeepSearchMode) systemPrompt += " You are in Deep Research Mode. Provide comprehensive, well-researched responses with multiple perspectives and detailed analysis.";

      let fileData = null;
      if (imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        fileData = { file: blob, base64, dataUrl: imageUrl };
      }

      clearInterval(loadingInterval);
      setIsLoading(false);
      setIsStreaming(true);

      setMessages(prev => [...prev, { role: "model" as const, parts: [{ text: "" }] }]);

      const aiResponse = await geminiService.generateStreamingResponse(
        enhancedMessage,
        systemPrompt,
        (_chunk, fullText) => {
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'model') {
              updated[lastIdx] = { ...updated[lastIdx], parts: [{ text: fullText }] };
            }
            return updated;
          });
        },
        fileData,
        selectedModel
      );

      setIsStreaming(false);

      const aiMessage: Message = { role: "model" as const, parts: [{ text: aiResponse }] };
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = aiMessage;
        return updated;
      });

      if (isCoderMode && (aiResponse.includes('FILE:') || aiResponse.includes('```'))) {
        const extractedFiles = extractCodeFromResponse(aiResponse);
        if (extractedFiles.length > 0) {
          setCanvasInitialFiles(extractedFiles);
          setCanvasInitialCode('');
          setIsAdvancedCanvasOpen(true);
          toast.success(`Generated ${extractedFiles.length} files`);
        } else if (aiResponse.includes('```')) {
          setCanvasInitialCode(aiResponse);
          setCanvasInitialFiles([]);
          setIsAdvancedCanvasOpen(true);
        }
      }

      if (user?.id) {
        try {
          let conversationId = activeConversationId;
          if (!conversationId) {
            const title = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '');
            const { data: newConv, error } = await supabase.from('conversations').insert({ user_id: user.id, title }).select().single();
            if (error) throw error;
            conversationId = newConv.id;
            setActiveConversationId(conversationId);
            await loadConversations();
          }
          await supabase.from('messages').insert([userMessage, aiMessage].map((msg, i) => ({
            conversation_id: conversationId,
            parts: msg.parts,
            role: msg.role,
            created_at: new Date(Date.now() + i).toISOString(),
            ...(msg.imageUrl && { image_url: msg.imageUrl })
          })));
        } catch { toast.error("Failed to save"); }
      }
    } catch {
      clearInterval(loadingInterval);
      setIsLoading(false);
      setIsStreaming(false);
      toast.error("Something went wrong");
      setMessages(currentMessages);
    }
  };

  const onFormSubmit = async (e: React.FormEvent, attachments?: FileUploadResult[]) => {
    e.preventDefault();
    await handleSendMessage(input, attachments);
  };

  const onReviewCode = (code: string) => {
    setCanvasInitialCode(code);
    setCanvasInitialFiles([]);
    setIsAdvancedCanvasOpen(true);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleRegenerate = () => {
    // Find last user message and resend it
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      // Remove the last AI response
      setMessages(prev => {
        const idx = prev.length - 1;
        if (prev[idx]?.role === 'model') return prev.slice(0, idx);
        return prev;
      });
      // Re-trigger with original text (after state update)
      setTimeout(() => {
        const text = lastUserMsg.parts[0]?.text || '';
        handleSendMessage(text);
      }, 100);
    }
  };

  const handleEditMessage = (newText: string) => {
    // Remove last user message + AI response, then send edited version
    setMessages(prev => {
      const copy = [...prev];
      // Remove last model message if exists
      if (copy[copy.length - 1]?.role === 'model') copy.pop();
      // Remove last user message
      if (copy[copy.length - 1]?.role === 'user') copy.pop();
      return copy;
    });
    setTimeout(() => handleSendMessage(newText), 100);
  };

  const handleNewChat = async () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput('');
    setCanvasInitialCode('');
    setCanvasInitialFiles([]);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <AppSidebar
          isSettingsOpen={false}
          setIsSettingsOpen={() => {}}
          tempApiKey=""
          setTempApiKey={() => {}}
          handleSaveApiKey={() => {}}
          handleNewChat={handleNewChat}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
        
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top bar */}
          <header className="flex items-center justify-between h-12 px-3 border-b border-border/30 glass z-10">
            <div className="flex items-center gap-2.5">
              <SidebarTrigger className="text-muted-foreground/60 hover:text-foreground transition-colors" />
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-2">
                <img src={adigonLogo} alt="AdiGon AI" className="w-5 h-5" />
                <span className="text-[13px] font-bold text-foreground tracking-tight">AdiGon AI</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userProfile?.name && (
                <span className="text-[11px] text-muted-foreground/50 hidden sm:block font-medium">
                  {userProfile.name.split(' ')[0]}
                </span>
              )}
              {messages.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] rounded-lg border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/20 gap-1.5 transition-all font-medium"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    <DropdownMenuItem onClick={() => exportAsMarkdown(messages, conversations.find(c => c.id === activeConversationId)?.title)} className="text-xs gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Markdown (.md)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportAsPDF(messages, conversations.find(c => c.id === activeConversationId)?.title)} className="text-xs gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Print / PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button
                onClick={() => setIsAdvancedCanvasOpen(true)}
                variant="outline"
                size="sm"
                className="h-7 text-[11px] rounded-lg border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/20 gap-1.5 transition-all font-medium"
              >
                <Zap className="w-3 h-3" />
                Canvas
              </Button>
            </div>
          </header>

          <EnhancedChatInterface
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            loadingMessage={loadingMessage}
            examplePrompts={examplePrompts}
            handleSendMessage={handleSendMessage}
            onReviewCode={onReviewCode}
            messagesEndRef={messagesEndRef}
            showScrollButton={showScrollButton}
            scrollToBottom={scrollToBottom}
          />
          
          <EnhancedChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading || isStreaming}
            isCoderMode={isCoderMode}
            setIsCoderMode={setIsCoderMode}
            isDeepSearchMode={isDeepSearchMode}
            setIsDeepSearchMode={setIsDeepSearchMode}
            onSubmit={onFormSubmit}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        <AdvancedDeveloperCanvas
          isOpen={isAdvancedCanvasOpen}
          onClose={() => { setIsAdvancedCanvasOpen(false); setCanvasInitialCode(''); setCanvasInitialFiles([]); }}
          initialCode={canvasInitialCode}
          initialFiles={canvasInitialFiles}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
