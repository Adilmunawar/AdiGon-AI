
import * as React from "react"
import { useState } from "react"
import {
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  LogOut,
  User,
  Sparkles,
} from "lucide-react"
import adigonLogo from "@/assets/adigon-logo.png"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/providers/AuthProvider"
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
    } catch {
      toast.error("Error signing out")
    }
  }

  return (
    <>
      <Sidebar className="border-r border-border/40 bg-sidebar">
        <SidebarHeader className="p-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md animate-breathe" />
              <img src={adigonLogo} alt="AdiGon AI" className="w-8 h-8 relative" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground tracking-tight leading-none">AdiGon AI</span>
              <span className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">Powered by Gemini</span>
            </div>
          </div>
        </SidebarHeader>

        <div className="px-3 py-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <SidebarContent className="px-3 mt-1">
          {conversations.length > 0 ? (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.12em] px-2 mb-1">
                Conversations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {conversations.slice(0, 20).map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <div className="flex items-center group">
                        <SidebarMenuButton
                          onClick={() => onSelectConversation(conversation.id)}
                          className={cn(
                            "flex-1 justify-start gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 h-auto min-h-0",
                            activeConversationId === conversation.id
                              ? "bg-primary/8 text-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          )}
                        >
                          <MessageSquare className={cn(
                            "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                            activeConversationId === conversation.id ? "text-primary/60" : "opacity-40"
                          )} />
                          <span className="truncate text-[13px] font-medium">{conversation.title}</span>
                        </SidebarMenuButton>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/8 transition-all mr-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <p className="text-xs text-muted-foreground/50 font-medium">No conversations yet</p>
              <p className="text-[11px] text-muted-foreground/30 mt-0.5">Start a new chat to begin</p>
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-border/40 p-3 space-y-0.5">
          <button
            onClick={() => setIsAdvancedSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          {user && (
            <>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-destructive/6 hover:text-destructive transition-all duration-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
              <div className="mt-1.5 mx-1 p-2.5 rounded-xl bg-muted/50 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                  <User className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-muted-foreground truncate block">{user.email}</span>
                </div>
              </div>
            </>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Advanced Settings */}
      <Dialog open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
        <DialogContent className="max-w-4xl w-full bg-background border-border/60 text-foreground max-h-[90vh] overflow-hidden p-0 rounded-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-lg font-bold tracking-tight">Settings</DialogTitle>
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
