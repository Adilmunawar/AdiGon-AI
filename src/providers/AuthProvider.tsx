
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`🔔 Auth event: ${event}`);
        
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          setInitialized(true);

          // Handle sign out navigation immediately
          if (event === 'SIGNED_OUT') {
            navigate('/auth', { replace: true });
          } else if (event === 'SIGNED_IN' && location.pathname === '/auth') {
            navigate('/', { replace: true });
          }
        }
      }
    );

    // Then get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle navigation for initial load
  useEffect(() => {
    if (!initialized || loading) return;

    const currentPath = location.pathname;
    if (session && currentPath === '/auth') {
      navigate('/', { replace: true });
    } else if (!session && currentPath !== '/auth') {
      navigate('/auth', { replace: true });
    }
  }, [session, initialized, loading]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const value = { user, session, loading, signOut };

  if (!initialized && location.pathname !== '/auth') {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
