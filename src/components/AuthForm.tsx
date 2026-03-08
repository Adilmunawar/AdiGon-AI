
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
import { LoaderCircle, Eye, EyeOff, AlertCircle, CheckCircle, Bot, Mail, Lock, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DeveloperCredit from "./DeveloperCredit";

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
    if (msg.includes('Email not confirmed')) return 'Please confirm your email first.';
    if (msg.includes('User already registered')) return 'Account exists. Please sign in.';
    if (msg.includes('Too many requests')) return 'Too many attempts. Please wait.';
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
        if (data.user) { setAuthSuccess('Welcome back!'); toast.success("Signed in!"); form.reset(); }
      } else {
        if (!values.name?.trim()) { setAuthError('Name is required'); return; }
        if (!values.gender) { setAuthError('Please select gender'); return; }
        const { data, error } = await supabase.auth.signUp({
          email: values.email, password: values.password,
          options: { data: { name: values.name.trim(), gender: values.gender }, emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) { setAuthError(handleAuthError(error)); return; }
        if (data.user) {
          setAuthSuccess(data.user.email_confirmed_at ? 'Account created!' : 'Check your email for confirmation.');
          toast.success("Account created!");
          form.reset();
          setTimeout(() => { setIsSignIn(true); setAuthSuccess(null); }, 3000);
        }
      }
    } catch { setAuthError('Something went wrong.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/8 mb-5">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1.5">
          {isSignIn ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignIn ? "Sign in to continue" : "Get started with AdiGon AI"}
        </p>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
        {authSuccess && (
          <Alert className="mb-4 border-primary/20 bg-primary/5 text-primary">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{authSuccess}</AlertDescription>
          </Alert>
        )}
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{authError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isSignIn && (
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                      <Input placeholder="Your name" {...field} disabled={isSubmitting} className="pl-9 h-10 bg-background border-border" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                    <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} autoComplete="email" className="pl-9 h-10 bg-background border-border" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isSubmitting} className="pl-9 pr-10 h-10 bg-background border-border" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {!isSignIn && (
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="h-10 bg-background border-border">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            <Button type="submit" className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {isSignIn ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 pt-4 border-t border-border/60 text-center">
          <button onClick={toggleFormType} disabled={isSubmitting} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <span className="text-primary font-medium">{isSignIn ? "Sign up" : "Sign in"}</span>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <DeveloperCredit />
      </div>
    </div>
  );
}
