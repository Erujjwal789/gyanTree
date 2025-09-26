import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, BookOpen, AlertCircle, Gift, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'donor' as UserRole,
    location: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await register(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.role,
        formData.location
      );
      if (success) {
        toast({
          title: "Account created!",
          description: `Welcome to Gyan Tree, ${formData.name}!`,
        });
        navigate('/dashboard');
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ form: 'Registration failed. Please try again.' });
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
          <h2 className="text-3xl font-bold text-foreground">Join Gyan Tree</h2>
          <p className="mt-2 text-muted-foreground">
            Start sharing knowledge and making a difference
          </p>
        </div>

        {/* Registration Form */}
        <Card className="card-gradient border-0">
          <CardHeader>
            <CardTitle className="text-center text-foreground">Create Your Account</CardTitle>
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
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                icon={<User className="w-4 h-4" />}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
              />

              <InputField
                label="Location"
                type="text"
                placeholder="Enter your city/location"
                icon={<Mail className="w-4 h-4" />}
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />

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
                placeholder="Create a password"
                icon={<Lock className="w-4 h-4" />}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
              />

              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                icon={<Lock className="w-4 h-4" />}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
              />

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  How would you like to participate?
                </Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value: UserRole) => handleInputChange('role', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="donor" id="donor" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                        <Gift className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <Label htmlFor="donor" className="font-medium cursor-pointer">
                          Book Donor
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          I want to donate books to help students
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="receiver" id="receiver" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Search className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="receiver" className="font-medium cursor-pointer">
                          Book Receiver
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          I'm looking for books and study materials
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};