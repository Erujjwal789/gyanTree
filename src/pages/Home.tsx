import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Heart, Star, ArrowRight, Gift, Search, Upload } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Gift,
      title: 'Donate Books',
      description: 'Share your books with students who need them most',
      color: 'text-success',
    },
    {
      icon: Search,
      title: 'Find Books',
      description: 'Discover textbooks and study materials for free',
      color: 'text-primary',
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with donors and learners in your area',
      color: 'text-warning',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Active Donors', icon: Users },
    { value: '5000+', label: 'Books Donated', icon: BookOpen },
    { value: '2500+', label: 'Students Helped', icon: Heart },
    { value: '4.8/5', label: 'User Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Share Knowledge,
            <br />
            <span className="text-white/90">Transform Lives</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Gyan Tree connects book donors with learners across India. 
            Join our mission to make education accessible for everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isAuthenticated ? (
              <Button size="hero" variant="secondary" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="hero" variant="secondary" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="hero" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                  <Link to="/books">
                    Browse Books
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-6 h-6 text-white/80" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Gyan Tree Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to share knowledge and access quality educational resources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-gradient text-center border-0">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of donors and learners in our mission to democratize education
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">
                    <Upload className="w-5 h-5 mr-2" />
                    Start Donating
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/books">
                    <Search className="w-5 h-5 mr-2" />
                    Find Books
                  </Link>
                </Button>
              </>
            )}
            {isAuthenticated && user?.role === 'donor' && (
              <Button size="lg" asChild>
                <Link to="/upload-book">
                  <Upload className="w-5 h-5 mr-2" />
                  Donate Your First Book
                </Link>
              </Button>
            )}
            {isAuthenticated && user?.role === 'receiver' && (
              <Button size="lg" asChild>
                <Link to="/books">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Available Books
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};