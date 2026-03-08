
import { useState, useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import { Sparkles, Zap, Code, Brain, Shield, Star, MessageSquare, TrendingUp } from "lucide-react";
import adigonLogo from "@/assets/adigon-logo.png";
import avatarFemale1 from "@/assets/avatar-female-1.png";
import avatarMale1 from "@/assets/avatar-male-1.png";
import avatarFemale3 from "@/assets/avatar-female-3.png";
import avatarMale2 from "@/assets/avatar-male-2.png";

const features = [
  { icon: Code, title: "Code Generation", desc: "Build full apps from prompts" },
  { icon: Brain, title: "Deep Research", desc: "Comprehensive analysis on any topic" },
  { icon: Zap, title: "Real-time Streaming", desc: "Watch responses appear instantly" },
  { icon: Shield, title: "Secure & Private", desc: "Your data stays protected" },
];

const avatars = [avatarFemale1, avatarMale1, avatarFemale3, avatarMale2];

const testimonials = [
  { name: "Sarah K.", role: "Frontend Developer", text: "AdiGon AI transformed how I build apps. Incredible speed!", avatar: avatarFemale1 },
  { name: "James M.", role: "Full Stack Engineer", text: "The code generation quality is unmatched. My go-to AI tool.", avatar: avatarMale1 },
  { name: "Yuki T.", role: "Product Designer", text: "Deep research mode saves me hours every single day.", avatar: avatarFemale3 },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "2M+", label: "Prompts Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "User Rating" },
];

const AnimatedCounter = ({ value }: { value: string }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <span className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {value}
    </span>
  );
};

const AuthPage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-primary/[0.02] to-transparent" />
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-[10%] left-[5%] w-80 h-80 rounded-full bg-primary/[0.06] blur-[100px] animate-pulse" />
        <div className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full bg-primary/[0.05] blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[60%] left-[40%] w-64 h-64 rounded-full bg-accent/[0.04] blur-[80px] animate-pulse" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top - Logo & Stats */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <img src={adigonLogo} alt="AdiGon AI" className="w-10 h-10" />
              <span className="text-lg font-bold tracking-tight text-foreground">AdiGon AI</span>
            </div>

            {/* Live stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-10">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-background/40 border border-border/40 backdrop-blur-sm">
                  <div className="text-lg font-bold text-foreground">
                    <AnimatedCounter value={value} />
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>
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
            <div className="grid grid-cols-2 gap-3 pt-2">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-3.5 rounded-xl bg-background/60 border border-border/50 backdrop-blur-sm hover:border-primary/20 hover:bg-background/80 transition-all duration-300 group">
                  <Icon className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[13px] font-semibold text-foreground mb-0.5">{title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - Testimonials & Avatars */}
          <div className="space-y-5">
            {/* Auto-rotating testimonial */}
            <div className="relative p-5 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-3 right-4 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="flex items-start gap-3">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[13px] text-foreground/90 leading-relaxed mb-2 italic">
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <p className="text-[12px] font-semibold text-foreground">{testimonials[activeTestimonial].name}</p>
                  <p className="text-[11px] text-muted-foreground">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1.5 mt-3 justify-center">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeTestimonial ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Diverse avatar row + community text */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {avatars.map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt="Community member"
                    className="w-9 h-9 rounded-full border-[2.5px] border-background object-cover shadow-sm hover:scale-110 hover:z-10 transition-transform duration-200 relative"
                    style={{ zIndex: avatars.length - i }}
                  />
                ))}
                <div className="w-9 h-9 rounded-full border-[2.5px] border-background bg-primary/10 flex items-center justify-center relative" style={{ zIndex: 0 }}>
                  <span className="text-[9px] font-bold text-primary">+50K</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Loved by developers worldwide</p>
                <p className="text-[11px] text-muted-foreground">Join 50,000+ builders using AdiGon AI daily</p>
              </div>
            </div>

            {/* Powered by Google */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground/60">Powered by</span>
              <svg viewBox="0 0 272 92" className="h-4 opacity-50" xmlns="http://www.w3.org/2000/svg">
                <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="hsl(var(--muted-foreground))"/>
                <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="hsl(var(--muted-foreground))"/>
                <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="hsl(var(--muted-foreground))"/>
                <path d="M225 3v65h-9.5V3h9.5z" fill="hsl(var(--muted-foreground))"/>
                <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.96 0-11.84 4.37-11.59 12.93z" fill="hsl(var(--muted-foreground))"/>
                <path d="M35.29 41.19V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49-.01z" fill="hsl(var(--muted-foreground))"/>
              </svg>
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
          
          {/* Mobile-only: Powered by Google */}
          <div className="flex items-center justify-center gap-2 mt-6 lg:hidden">
            <span className="text-[11px] text-muted-foreground/50">Powered by</span>
            <svg viewBox="0 0 272 92" className="h-3.5 opacity-40" xmlns="http://www.w3.org/2000/svg">
              <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="hsl(var(--muted-foreground))"/>
              <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="hsl(var(--muted-foreground))"/>
              <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="hsl(var(--muted-foreground))"/>
              <path d="M225 3v65h-9.5V3h9.5z" fill="hsl(var(--muted-foreground))"/>
              <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.96 0-11.84 4.37-11.59 12.93z" fill="hsl(var(--muted-foreground))"/>
              <path d="M35.29 41.19V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49-.01z" fill="hsl(var(--muted-foreground))"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
