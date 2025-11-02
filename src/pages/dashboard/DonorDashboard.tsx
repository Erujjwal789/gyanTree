import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Book } from '@/components/ui/book-card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle, 
  Heart,
  TrendingUp,
  Bell,
  Library,
  XCircle
} from 'lucide-react';

interface BookRequest {
  id: string;
  book_id: string | null;
  title: string;
  author: string;
  category: string;
  status: string;
  reason: string | null;
  created_at: string;
  user_id: string;
  requester?: {
    display_name: string | null;
  };
}

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    booksDonated: 0,
    activeRequests: 0,
    studentsHelped: 0,
    totalValue: 0
  });

  // Fetch donor's books
  const fetchMyBooks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const booksData: Book[] = (data || []).map(book => ({
        id: book.id,
        title: book.title,
        subject: book.subject,
        grade: book.grade,
        condition: book.condition as 'excellent' | 'good' | 'fair',
        description: book.description || '',
        location: book.location,
        donorName: user.name || 'You',
        donorId: user.id,
        status: book.status as 'available' | 'requested' | 'donated',
        createdAt: book.created_at || '',
        photo: book.photo_url || '/placeholder.svg'
      }));

      setMyBooks(booksData);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        booksDonated: booksData.length
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Fetch requests for donor's books
  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      // Get donor's book IDs first
      const { data: donorBooks } = await supabase
        .from('books')
        .select('id')
        .eq('user_id', user.id);

      const donorBookIds = donorBooks?.map(b => b.id) || [];
      
      if (donorBookIds.length === 0) {
        setRequests([]);
        return;
      }

      // Get all requests for books donated by this user (pending and approved)
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .in('book_id', donorBookIds)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch requester profiles
      const userIds = data?.map(r => r.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const requestsWithProfiles = (data || []).map(req => ({
        ...req,
        requester: profilesData?.find(p => p.user_id === req.user_id) || null
      }));

      setRequests(requestsWithProfiles as any);
      
      // Update stats - count all requests (pending + approved)
      const { data: allRequests } = await supabase
        .from('book_requests')
        .select('*')
        .in('book_id', donorBookIds);

      const pendingApprovedCount = allRequests?.filter(r => r.status === 'pending' || r.status === 'approved').length || 0;
      const deliveredCount = allRequests?.filter(r => r.status === 'delivered').length || 0;
      const totalValue = deliveredCount * 500; // Assuming ₹500 per book

      setStats(prev => ({
        ...prev,
        activeRequests: pendingApprovedCount,
        studentsHelped: deliveredCount,
        totalValue
      }));
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Handle approve/reject/delivered request
  const handleRequestAction = async (requestId: string, bookId: string | null, action: 'approved' | 'rejected' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('book_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      // Update book status if approved or delivered
      if (bookId && (action === 'approved' || action === 'delivered')) {
        const bookStatus = action === 'delivered' ? 'donated' : 'requested';
        const { error: bookError } = await supabase
          .from('books')
          .update({ status: bookStatus })
          .eq('id', bookId);

        if (bookError) {
          console.error('Error updating book status:', bookError);
        }
      }

      const messages = {
        approved: { title: "Request Approved! ✅", description: "The receiver will be notified about your approval." },
        rejected: { title: "Request Declined", description: "The request has been declined." },
        delivered: { title: "Book Delivered! 📚", description: "Marked as delivered. Great work helping a student!" }
      };

      toast(messages[action]);

      // Refresh data
      fetchRequests();
      fetchMyBooks();
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchMyBooks();
    fetchRequests();
    setLoading(false);

    // Subscribe to new book requests
    const requestsChannel = supabase
      .channel('donor-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    // Subscribe to book changes
    const booksChannel = supabase
      .channel('donor-books')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchMyBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(booksChannel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statsDisplay = [
    {
      title: 'Books Donated',
      value: stats.booksDonated.toString(),
      change: `${myBooks.filter(b => b.status === 'available').length} available`,
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: 'Active Requests',
      value: stats.activeRequests.toString(),
      change: 'pending approval',
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'Students Helped',
      value: stats.studentsHelped.toString(),
      change: 'books delivered',
      icon: Users,
      color: 'text-success',
    },
    {
      title: 'Total Value',
      value: `₹${stats.totalValue}`,
      change: 'money saved',
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-radial py-8 relative overflow-hidden">
      {/* Animated background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Heart className="w-4 h-4 text-primary icon-glow" />
            <span className="text-sm font-medium text-foreground">Donor Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-foreground">Welcome back, </span>
            <span className="text-gradient">{user?.name}! 👋</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Your generosity is making education accessible. Here's your impact dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="hero" asChild>
              <Link to="/books/donate">
                <Upload className="w-5 h-5 mr-2" />
                Donate New Book
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link to="/books/my-books">
                <Library className="w-5 h-5 mr-2" />
                My Books
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link to="/books/requests">
                <Bell className="w-5 h-5 mr-2" />
                View All Requests
                {requests.length > 0 && (
                  <Badge className="ml-2 bg-warning text-warning-foreground">
                    {requests.length}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="stat-card p-6 rounded-2xl group hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center icon-glow ${stat.color}`}>
                  <stat.icon className="w-7 h-7 text-background" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Books */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  My Donated Books
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/books/my-books">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {myBooks.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No books donated yet</p>
                    <Button size="sm" className="mt-4" asChild>
                      <Link to="/books/donate">Donate Your First Book</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myBooks.slice(0, 3).map((book) => (
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
                )}
              </CardContent>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No pending requests</p>
                    </div>
                  ) : (
                    <>
                      {requests.slice(0, 3).map((request) => (
                        <div key={request.id} className="p-4 bg-accent/30 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm text-foreground line-clamp-1">{request.title}</h4>
                            <Badge 
                              variant="default" 
                              className={`text-xs ${request.status === 'approved' ? 'bg-blue-100 text-blue-800' : ''}`}
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {(request.requester as any)?.display_name || 'Student'}
                          </p>
                          {request.reason && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 italic">
                              "{request.reason}"
                            </p>
                          )}
                          
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleRequestAction(request.id, request.book_id, 'rejected')}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Decline
                              </Button>
                              <Button 
                                size="sm" 
                                variant="success"
                                className="flex-1"
                                onClick={() => handleRequestAction(request.id, request.book_id, 'approved')}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                            </div>
                          )}
                          
                          {request.status === 'approved' && (
                            <Button 
                              size="sm" 
                              variant="gradient"
                              className="w-full"
                              onClick={() => handleRequestAction(request.id, request.book_id, 'delivered')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link to="/books/requests">View All Requests</Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="mt-8 animate-fade-in">
          <div className="glass-card rounded-2xl neon-border p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">
                <span className="text-foreground">Your </span>
                <span className="text-gradient">Impact This Month</span>
              </h3>
              <p className="text-muted-foreground">Making education accessible, one book at a time</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-background/30 rounded-xl border border-primary/20">
                <div className="text-5xl font-bold text-gradient mb-2">{stats.studentsHelped}</div>
                <p className="text-sm text-muted-foreground font-medium">Students Reached</p>
              </div>
              <div className="text-center p-6 bg-background/30 rounded-xl border border-primary/20">
                <div className="text-5xl font-bold text-gradient mb-2">₹{stats.totalValue.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground font-medium">Money Saved by Students</p>
              </div>
              <div className="text-center p-6 bg-background/30 rounded-xl border border-primary/20">
                <div className="text-5xl font-bold text-gradient mb-2">{stats.booksDonated}</div>
                <p className="text-sm text-muted-foreground font-medium">Total Books Donated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};