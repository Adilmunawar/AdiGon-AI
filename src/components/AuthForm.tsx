
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { LoaderCircle, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DeveloperCredit from "./DeveloperCredit";
import { cn } from "@/lib/utils";
import adigonLogo from "@/assets/adigon-logo.png";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
  name: z.string().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "", name: "", gender: undefined },
  });

  const toggleFormType = () => {
    setIsSignIn(!isSignIn);
    setAuthError(null);
    setAuthSuccess(null);
    form.reset();
  };

  const handleAuthError = (error: any) => {
    const msg = error?.message || 'An unexpected error occurred';
    if (msg.includes('Invalid login credentials')) return 'Invalid email or password.';
    if (msg.includes('Email not confirmed')) return 'Please check your inbox and confirm your email first.';
    if (msg.includes('User already registered')) return 'This account already exists. Try signing in.';
    if (msg.includes('Too many requests')) return 'Too many attempts. Please wait a moment.';
    return msg;
  };

  const onSubmit = async (values: AuthFormData) => {
    setIsSubmitting(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (isSignIn) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
        if (error) { setAuthError(handleAuthError(error)); return; }
        if (data.user) { setAuthSuccess('Welcome back!'); toast.success("Signed in successfully!"); form.reset(); }
      } else {
        if (!values.name?.trim()) { setAuthError('Please enter your name.'); return; }
        if (!values.gender) { setAuthError('Please select your gender.'); return; }
        const { data, error } = await supabase.auth.signUp({
          email: values.email, password: values.password,
          options: { data: { name: values.name.trim(), gender: values.gender }, emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) { setAuthError(handleAuthError(error)); return; }
        if (data.user) {
          setAuthSuccess(data.user.email_confirmed_at ? 'Account created!' : 'Check your email to confirm your account.');
          toast.success("Account created!");
          form.reset();
          setTimeout(() => { setIsSignIn(true); setAuthSuccess(null); }, 3000);
        }
      }
    } catch { setAuthError('Something went wrong. Please try again.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="w-full">
      {/* Mobile-only logo */}
      <div className="flex items-center gap-2.5 mb-8 lg:hidden">
        <img src={adigonLogo} alt="AdiGon AI" className="w-9 h-9" />
        <span className="text-base font-bold text-foreground tracking-tight">AdiGon AI</span>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-muted/50 rounded-xl p-1 mb-8">
        <button
          onClick={() => { if (!isSignIn) toggleFormType(); }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            isSignIn
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sign In
        </button>
        <button
          onClick={() => { if (isSignIn) toggleFormType(); }}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            !isSignIn
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Create Account
        </button>
      </div>

      {/* Header text */}
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground mb-1">
          {isSignIn ? "Welcome back" : "Get started"}
        </h1>
        <p className="text-[13px] text-muted-foreground">
          {isSignIn ? "Enter your credentials to continue" : "Create your free account to begin"}
        </p>
      </div>

      {/* Alerts */}
      {authSuccess && (
        <Alert className="mb-5 border-primary/20 bg-primary/5 text-primary rounded-xl">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-sm font-medium">{authSuccess}</AlertDescription>
        </Alert>
      )}
      {authError && (
        <Alert variant="destructive" className="mb-5 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{authError}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {!isSignIn && (
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium text-foreground/80">Full Name</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-[18px] w-[18px] transition-colors group-focus-within:text-primary/60" />
                    <Input placeholder="John Doe" {...field} disabled={isSubmitting} className="pl-11 h-12 bg-background border-border/80 rounded-xl text-[15px] transition-all focus:border-primary/30 focus:shadow-[0_0_0_3px_hsl(168_80%_38%/0.06)]" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-medium text-foreground/80">Email</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-[18px] w-[18px] transition-colors group-focus-within:text-primary/60" />
                  <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} autoComplete="email" className="pl-11 h-12 bg-background border-border/80 rounded-xl text-[15px] transition-all focus:border-primary/30 focus:shadow-[0_0_0_3px_hsl(168_80%_38%/0.06)]" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-medium text-foreground/80">Password</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 h-[18px] w-[18px] transition-colors group-focus-within:text-primary/60" />
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isSubmitting} className="pl-11 pr-12 h-12 bg-background border-border/80 rounded-xl text-[15px] transition-all focus:border-primary/30 focus:shadow-[0_0_0_3px_hsl(168_80%_38%/0.06)]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {!isSignIn && (
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-medium text-foreground/80">Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-background border-border/80 rounded-xl text-[15px]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-[15px] transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-primary/15 group" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSignIn ? "Sign In" : "Create Account"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8">
        <DeveloperCredit />
      </div>
    </div>
  );
}
