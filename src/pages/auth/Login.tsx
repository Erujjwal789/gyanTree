import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast({
          title: "Welcome back! 🎉",
          description: "You've been logged in successfully.",
        });
        navigate('/dashboard');
      } else {
        setErrors({ form: 'Invalid email or password' });
      }
    } catch (error) {
      setErrors({ form: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center icon-glow shadow-[0_0_40px_rgba(0,210,106,0.4)]">
              <BookOpen className="w-10 h-10 text-background" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Sparkles className="w-4 h-4 text-primary icon-glow" />
            <span className="text-sm font-medium text-foreground">Gyan Tree</span>
          </div>
          <h2 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Welcome</span>
            <span className="text-foreground"> Back</span>
          </h2>
          <p className="text-muted-foreground">
            Sign in to continue sharing knowledge
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 rounded-3xl neon-border animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="space-y-4">
              <InputField
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
              />
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-glow font-semibold transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="glass-card p-6 rounded-2xl animate-fade-in border border-primary/20">
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Demo Credentials
            </p>
            <div className="text-xs text-muted-foreground space-y-2 bg-background/50 p-4 rounded-xl">
              <p className="font-medium"> Donor: xyza@gmail.com</p>
              <p className="font-medium"> Receiver: rev@gmail.com</p>
              <p className="text-primary font-semibold mt-2">Password: 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
