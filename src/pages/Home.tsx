import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Heart, Star, ArrowRight, Gift, Search, Upload, TrendingUp, Zap, Target } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Gift,
      title: 'Donate Books',
      description: 'Share your books with students who need them most',
      color: 'text-primary',
      gradient: 'from-primary/20 to-primary/5',
    },
    {
      icon: Search,
      title: 'Find Books',
      description: 'Discover textbooks and study materials for free',
      color: 'text-secondary',
      gradient: 'from-secondary/20 to-secondary/5',
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with donors and learners in your area',
      color: 'text-warning',
      gradient: 'from-warning/20 to-warning/5',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Active Donors', icon: Users, color: 'text-primary' },
    { value: '5000+', label: 'Books Donated', icon: BookOpen, color: 'text-secondary' },
    { value: '2500+', label: 'Students Helped', icon: Heart, color: 'text-warning' },
    { value: '4.8/5', label: 'User Rating', icon: Star, color: 'text-primary' },
  ];

  const impactStats = [
    { icon: TrendingUp, value: '95%', label: 'Success Rate', color: 'text-primary' },
    { icon: Zap, value: '<24h', label: 'Avg Response', color: 'text-secondary' },
    { icon: Target, value: '100%', label: 'Free Access', color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Glassmorphism */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden hero-pattern">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background"></div>
        
        {/* Animated Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary icon-glow" />
            <span className="text-sm font-medium text-foreground">Making Education Accessible</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">
            <span className="text-gradient">Share Knowledge,</span>
            <br />
            <span className="text-foreground">Transform Lives</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed">
            Gyan Tree connects book donors with learners across India. 
            Join our mission to make education accessible for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in">
            {isAuthenticated ? (
              <Button size="hero" variant="gradient" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="hero" variant="hero" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="hero" variant="glass" asChild>
                  <Link to="/books">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Books
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Stats Grid with Glass Effect */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl group">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center icon-glow">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-radial relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Target className="w-4 h-4 text-primary icon-glow" />
              <span className="text-sm font-medium text-foreground">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Simple</span>
              <span className="text-foreground"> Steps to Share Knowledge</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands making education accessible through our seamless platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-8 rounded-2xl group hover:scale-105 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 icon-glow`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                <div className="mt-6 flex items-center gap-2 text-primary group-hover:gap-4 transition-all">
                  <span className="font-medium">Learn more</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Our </span>
              <span className="text-gradient">Impact</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real numbers, real change
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => (
              <div key={index} className="stat-card p-8 rounded-2xl text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center icon-glow">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-5xl font-bold mb-3 text-gradient">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 rounded-3xl neon-border">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">Ready to Make a </span>
              <span className="text-gradient">Difference?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Join thousands of donors and learners in our mission to democratize education
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated && (
                <>
                  <Button size="hero" variant="hero" asChild>
                    <Link to="/register">
                      <Upload className="w-5 h-5 mr-2" />
                      Start Donating
                    </Link>
                  </Button>
                  <Button size="hero" variant="glass" asChild>
                    <Link to="/books">
                      <Search className="w-5 h-5 mr-2" />
                      Find Books
                    </Link>
                  </Button>
                </>
              )}
              {isAuthenticated && user?.role === 'donor' && (
                <Button size="hero" variant="hero" asChild>
                  <Link to="/books/donate">
                    <Upload className="w-5 h-5 mr-2" />
                    Donate Your First Book
                  </Link>
                </Button>
              )}
              {isAuthenticated && user?.role === 'receiver' && (
                <Button size="hero" variant="hero" asChild>
                  <Link to="/books">
                    <Search className="w-5 h-5 mr-2" />
                    Browse Available Books
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
