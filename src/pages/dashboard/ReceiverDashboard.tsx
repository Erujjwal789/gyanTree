import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookCard, type Book } from '@/components/ui/book-card';
import { 
  Search, 
  BookOpen, 
  MapPin, 
  Filter,
  Heart,
  Clock,
  CheckCircle,
  Star
} from 'lucide-react';

export const ReceiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: 'Books Requested',
      value: '8',
      change: '+3 this month',
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: 'Books Received',
      value: '5',
      change: '+2 this month',
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      title: 'Money Saved',
      value: '₹4,500',
      change: '+₹1,200 this month',
      icon: Star,
      color: 'text-warning',
    },
    {
      title: 'Active Requests',
      value: '3',
      change: '2 pending approval',
      icon: Clock,
      color: 'text-secondary-foreground',
    },
  ];

  const recentBooks: Book[] = [
    {
      id: '1',
      title: 'Chemistry Class 12',
      subject: 'Chemistry',
      grade: '12',
      condition: 'excellent' as const,
      description: 'NCERT Chemistry textbook with solved examples',
      location: 'Andheri, Mumbai',
      donorName: 'Rajesh Patel',
      donorId: '2',
      status: 'available' as const,
      createdAt: '2024-01-20',
      photo: '/api/placeholder/300/200',
    },
    {
      id: '2',
      title: 'English Grammar Guide',
      subject: 'English',
      grade: '10',
      condition: 'good' as const,
      description: 'Comprehensive grammar guide with practice exercises',
      location: 'Bandra, Mumbai',
      donorName: 'Priya Singh',
      donorId: '3',
      status: 'available' as const,
      createdAt: '2024-01-19',
      photo: '/api/placeholder/300/200',
    },
    {
      id: '3',
      title: 'Mathematics for JEE',
      subject: 'Mathematics',
      grade: '12',
      condition: 'excellent' as const,
      description: 'Advanced mathematics for competitive exam preparation',
      location: 'Powai, Mumbai',
      donorName: 'Amit Kumar',
      donorId: '4',
      status: 'available' as const,
      createdAt: '2024-01-18',
      photo: '/api/placeholder/300/200',
    },
  ];

  const myRequests = [
    {
      id: '1',
      bookTitle: 'Physics Class 11',
      donorName: 'Suresh Agarwal',
      requestDate: '2024-01-18',
      status: 'pending',
      estimatedValue: '₹800',
    },
    {
      id: '2',
      bookTitle: 'Biology Textbook',
      donorName: 'Kavita Sharma',
      requestDate: '2024-01-15',
      status: 'accepted',
      estimatedValue: '₹600',
    },
    {
      id: '3',
      bookTitle: 'History Class 10',
      donorName: 'Ravi Gupta',
      requestDate: '2024-01-12',
      status: 'completed',
      estimatedValue: '₹450',
    },
  ];

  const handleBookRequest = (book: Book) => {
    // Handle book request
    console.log('Requesting book:', book);
  };

  const handleViewDetails = (book: Book) => {
    // Handle view details
    console.log('Viewing book details:', book);
  };

  return (
    <div className="min-h-screen bg-secondary/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 📚
          </h1>
          <p className="text-muted-foreground">
            Find the perfect books for your studies and continue your learning journey.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <Card className="card-gradient border-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <InputField
                    placeholder="Search for books by title, subject, or grade..."
                    icon={<Search className="w-4 h-4" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button size="lg">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/books">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse All Books
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/my-requests">
                <Heart className="w-4 h-4 mr-2" />
                My Requests ({myRequests.filter(r => r.status === 'pending').length} pending)
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="card-gradient border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recently Added Books */}
          <div className="lg:col-span-2">
            <Card className="card-gradient border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recently Added Books
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/books">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {recentBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onViewDetails={handleViewDetails}
                      onRequest={handleBookRequest}
                      compact
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Requests */}
          <div className="lg:col-span-1">
            <Card className="card-gradient border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  My Recent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-foreground">{request.bookTitle}</h4>
                        <Badge
                          variant={
                            request.status === 'pending' 
                              ? 'default' 
                              : request.status === 'accepted' 
                                ? 'secondary' 
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {request.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {request.status === 'completed' && <Star className="w-3 h-3 mr-1" />}
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        by {request.donorName}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {request.requestDate}
                        </p>
                        <p className="text-xs font-medium text-success">
                          Saves {request.estimatedValue}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/my-requests">View All Requests</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning Impact */}
        <div className="mt-8">
          <Card className="card-gradient border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Your Learning Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">5</div>
                  <p className="text-sm text-muted-foreground">Books Received</p>
                  <p className="text-xs text-muted-foreground mt-1">This semester</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-2">₹4,500</div>
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-xs text-muted-foreground mt-1">Money not spent on books</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-warning mb-2">12</div>
                  <p className="text-sm text-muted-foreground">Donors Helped You</p>
                  <p className="text-xs text-muted-foreground mt-1">Generous community members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};