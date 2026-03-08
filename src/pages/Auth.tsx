
import AuthForm from "@/components/AuthForm";
import { Sparkles, Zap, Code, Brain, Shield } from "lucide-react";
import adigonLogo from "@/assets/adigon-logo.png";

const features = [
  { icon: Code, title: "Code Generation", desc: "Build full apps from prompts" },
  { icon: Brain, title: "Deep Research", desc: "Comprehensive analysis on any topic" },
  { icon: Zap, title: "Real-time Streaming", desc: "Watch responses appear instantly" },
  { icon: Shield, title: "Secure & Private", desc: "Your data stays protected" },
];

const AuthPage = () => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.03]" />
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-[10%] left-[5%] w-80 h-80 rounded-full bg-primary/[0.05] blur-[100px]" />
        <div className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full bg-primary/[0.04] blur-[120px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top */}
          <div className="flex items-center gap-3">
            <img src={adigonLogo} alt="AdiGon AI" className="w-10 h-10" />
            <span className="text-lg font-bold tracking-tight text-foreground">AdiGon AI</span>
          </div>

          {/* Center hero */}
          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/12">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Powered by Gemini 2.5</span>
            </div>

            <h1 className="text-[42px] font-bold tracking-tight text-foreground leading-[1.1]">
              Think bigger.
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Build faster.</span>
            </h1>

            <p className="text-muted-foreground text-[15px] leading-relaxed max-w-sm">
              Your AI-powered workspace for code generation, deep research, creative writing, and intelligent conversations.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-3.5 rounded-xl bg-background/60 border border-border/60 backdrop-blur-sm">
                  <Icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-[13px] font-semibold text-foreground mb-0.5">{title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {['A', 'M', 'S', 'K', 'R'].map((letter, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary/70">{letter}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Join the community</p>
              <p className="text-[11px] text-muted-foreground">Thousands of developers trust AdiGon AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="absolute inset-0 -z-10 lg:hidden">
          <div className="absolute top-[15%] right-[15%] w-72 h-72 rounded-full bg-primary/[0.04] blur-[80px]" />
          <div className="absolute bottom-[20%] left-[10%] w-64 h-64 rounded-full bg-primary/[0.03] blur-[60px]" />
        </div>
        
        <div className="w-full max-w-[420px] animate-fade-in-up">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
