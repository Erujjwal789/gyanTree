import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookCard, type Book } from '@/components/ui/book-card';
import { 
  Upload, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle, 
  Heart,
  TrendingUp,
  Bell,
  Library
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: 'Books Donated',
      value: '12',
      change: '+2 this month',
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: 'Active Requests',
      value: '5',
      change: '3 pending',
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'Students Helped',
      value: '28',
      change: '+8 this month',
      icon: Users,
      color: 'text-success',
    },
    {
      title: 'Impact Score',
      value: '85%',
      change: '+5% this week',
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  const myBooks: Book[] = [
    {
      id: '1',
      title: 'Mathematics Class 10',
      subject: 'Mathematics',
      grade: '10',
      condition: 'excellent' as const,
      description: 'NCERT Mathematics textbook in excellent condition',
      location: 'Mumbai, Maharashtra',
      donorName: user?.name || 'You',
      donorId: user?.id || '1',
      status: 'available' as const,
      createdAt: '2024-01-15',
      photo: '/api/placeholder/300/200',
    },
    {
      id: '2',
      title: 'Physics Concepts',
      subject: 'Physics',
      grade: '12',
      condition: 'good' as const,
      description: 'Comprehensive physics guide for competitive exams',
      location: 'Mumbai, Maharashtra',
      donorName: user?.name || 'You',
      donorId: user?.id || '1',
      status: 'requested' as const,
      createdAt: '2024-01-10',
      photo: '/api/placeholder/300/200',
    },
  ];

  const recentRequests = [
    {
      id: '1',
      bookTitle: 'Mathematics Class 10',
      requesterName: 'Priya Sharma',
      requestDate: '2024-01-20',
      status: 'pending',
      message: 'Hi! I really need this book for my board exam preparation. Thank you!',
    },
    {
      id: '2',
      bookTitle: 'Physics Concepts',
      requesterName: 'Rahul Kumar',
      requestDate: '2024-01-19',
      status: 'accepted',
      message: 'This book would be perfect for my JEE preparation.',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Your generosity is making education accessible. Here's your impact dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link to="/donate-book">
                <Upload className="w-5 h-5 mr-2" />
                Donate New Book
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/my-books">
                <Library className="w-5 h-5 mr-2" />
                My Books
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/book-requests">
                <Bell className="w-5 h-5 mr-2" />
                View All Requests
                {recentRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge className="ml-2 bg-warning text-warning-foreground">
                    {recentRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
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
                  <div className={`w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Books */}
          <div className="lg:col-span-2">
            <Card className="card-gradient border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  My Donated Books
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/my-books">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {myBooks.map((book) => (
                    <div key={book.id} className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg">
                      <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{book.title}</h4>
                        <p className="text-sm text-muted-foreground">{book.subject} • Grade {book.grade}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={book.status === 'available' ? 'default' : book.status === 'requested' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {book.status === 'available' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {book.status === 'requested' && <Clock className="w-3 h-3 mr-1" />}
                            {book.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          <div className="lg:col-span-1">
            <Card className="card-gradient border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-foreground">{request.bookTitle}</h4>
                        <Badge
                          variant={request.status === 'pending' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {request.requesterName}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {request.message}
                      </p>
                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1">Accept</Button>
                          <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/book-requests">View All Requests</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Section */}
        <div className="mt-8">
          <Card className="card-gradient border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Your Impact This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">28</div>
                  <p className="text-sm text-muted-foreground">Students Reached</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-2">₹15,600</div>
                  <p className="text-sm text-muted-foreground">Money Saved by Students</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-warning mb-2">95%</div>
                  <p className="text-sm text-muted-foreground">Positive Feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};