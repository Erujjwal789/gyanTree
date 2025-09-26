import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'donor' | 'receiver';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  address?: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole, location?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          // Handle user profile asynchronously without blocking the auth state change
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              if (!mounted) return;
              
              if (profile) {
                setUser({
                  id: session.user.id,
                  email: session.user.email!,
                  name: profile.display_name || session.user.email!.split('@')[0],
                  role: session.user.user_metadata?.role || 'receiver',
                  location: profile.location
                });
              } else {
                // If no profile exists, create one
                const newProfile = {
                  user_id: session.user.id,
                  display_name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
                  location: session.user.user_metadata?.location || ''
                };
                
                const { error } = await supabase.from('profiles').insert([newProfile]);
                
                if (!mounted) return;
                
                if (!error) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: newProfile.display_name,
                    role: session.user.user_metadata?.role || 'receiver',
                    location: newProfile.location
                  });
                }
              }
            } catch (error) {
              console.error('Error handling user profile:', error);
              if (!mounted) return;
              
              // Fallback: set user without profile data
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.email!.split('@')[0],
                role: session.user.user_metadata?.role || 'receiver',
                location: ''
              });
            }
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      // Session will be handled by the auth state change listener
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return !error;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole, location?: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role,
            location: location || ''
          }
        }
      });
      
      return !error;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!session,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};