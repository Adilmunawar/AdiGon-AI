
import * as React from "react"
import { useState } from "react"
import {
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Key,
  LogOut,
  User,
  Zap,
  MoreHorizontal
} from "lucide-react"
import adigonLogo from "@/assets/adigon-logo.png"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/providers/AuthProvider"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/components/ui/sonner"
import AdvancedSettings from "./AdvancedSettings"

interface AppSidebarProps {
  isSettingsOpen: boolean
  setIsSettingsOpen: (open: boolean) => void
  tempApiKey: string
  setTempApiKey: (key: string) => void
  handleSaveApiKey: () => void
  handleNewChat: () => Promise<void>
  conversations: { id: string; title: string }[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export default function AppSidebar({
  isSettingsOpen,
  setIsSettingsOpen,
  tempApiKey,
  setTempApiKey,
  handleSaveApiKey,
  handleNewChat,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: AppSidebarProps) {
  const { user, signOut } = useAuth()
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  return (
    <>
      <Sidebar className="border-r border-border/60 bg-card/50">
        <SidebarHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">AdiGon AI</span>
            </div>
          </div>
        </SidebarHeader>

        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>

        <SidebarContent className="px-3">
          {conversations.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest px-0 mb-1">
                Recent
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {conversations.slice(0, 15).map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <div className="flex items-center group">
                        <SidebarMenuButton
                          onClick={() => onSelectConversation(conversation.id)}
                          className={cn(
                            "flex-1 justify-start gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 h-auto min-h-0",
                            activeConversationId === conversation.id
                              ? "bg-primary/8 text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                          <span className="truncate text-[13px]">{conversation.title}</span>
                        </SidebarMenuButton>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/8 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-border/60 p-3 space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            API Settings
          </button>
          <button
            onClick={() => setIsAdvancedSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          {user && (
            <>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-muted-foreground hover:bg-destructive/8 hover:text-destructive transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
              <div className="mt-2 px-2.5 py-2 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-[12px] text-muted-foreground truncate">{user.email}</span>
              </div>
            </>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* API Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent side="left" className="w-[380px] bg-background border-border/60">
          <SheetHeader>
            <SheetTitle className="text-foreground text-lg font-semibold tracking-tight">API Configuration</SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              Configure your Gemini API key
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-foreground text-sm font-medium">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="h-10 bg-card border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Get your key from{" "}
                <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google AI Studio
                </a>
              </p>
            </div>
            <Button onClick={handleSaveApiKey} className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Advanced Settings */}
      <Dialog open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
        <DialogContent className="max-w-4xl w-full bg-background border-border/60 text-foreground max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg font-semibold tracking-tight">Settings</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Customize your experience</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <AdvancedSettings />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
