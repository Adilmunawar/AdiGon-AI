
import AuthForm from "@/components/AuthForm";
import { Sparkles } from "lucide-react";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-primary/[0.04] via-background to-primary/[0.02] items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl" />
          <div className="absolute top-[50%] left-[40%] w-48 h-48 rounded-full bg-primary/[0.05] blur-2xl" />
          
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Powered by Gemini</span>
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
            Your AI-powered
            <br />
            <span className="text-primary">creative partner</span>
          </h2>
          
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Generate code, explore ideas, research topics, and build anything — all through natural conversation.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Code Generation', 'Deep Research', 'Image Analysis', 'Creative Writing'].map((feature) => (
              <span key={feature} className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium text-muted-foreground">
                {feature}
              </span>
            ))}
          </div>

          {/* Testimonial / social proof */}
          <div className="pt-6 border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-primary/60">{['A', 'M', 'S', 'K'][i]}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Trusted by developers</p>
                <p className="text-xs text-muted-foreground">Join thousands using AdiGon AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[20%] right-[20%] w-64 h-64 rounded-full bg-primary/[0.03] blur-3xl lg:hidden" />
        </div>
        
        <div className="w-full max-w-[400px] animate-fade-in-up">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
