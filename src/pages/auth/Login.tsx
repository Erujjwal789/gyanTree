import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, BookOpen, AlertCircle } from 'lucide-react';
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
          title: "Welcome back!",
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
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue sharing knowledge
          </p>
        </div>

        {/* Login Form */}
        <Card className="card-gradient border-0">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Login to Gyan Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.form}
                </div>
              )}

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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="card-gradient border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-2">Demo Credentials</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Email: donor@gyantree.org (Donor)</p>
                <p>Email: receiver@gyantree.org (Receiver)</p>
                <p>Password: password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};