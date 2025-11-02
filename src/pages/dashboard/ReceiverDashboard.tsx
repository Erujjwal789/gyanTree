import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from 'sonner';

export const ReceiverDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    booksRequested: 0,
    booksReceived: 0,
    moneySaved: 0,
    activeRequests: 0
  });
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBooks();
      fetchMyRequests();
    }

    // Set up real-time subscription for new books
    const booksChannel = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'books',
          filter: 'status=eq.available'
        },
        () => {
          fetchBooks(); // Refresh books when new book is added
        }
      )
      .subscribe();

    // Set up real-time subscription for book requests
    const requestsChannel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_requests'
        },
        () => {
          if (user) {
            fetchMyRequests(); // Refresh requests on any change
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(booksChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [user]);

  const fetchBooks = async () => {
    try {
      // Fetch books
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(10);

      if (booksError) throw booksError;

      if (!booksData || booksData.length === 0) {
        setBooks([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(booksData.map(book => book.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, location')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map(
        (profilesData || []).map(profile => [profile.user_id, profile])
      );

      // Combine books with their donor profiles
      const formattedBooks: Book[] = booksData.map((book: any) => {
        const profile = profilesMap.get(book.user_id);
        return {
          id: book.id,
          title: book.title,
          subject: book.subject,
          grade: book.grade,
          condition: book.condition,
          description: book.description,
          location: profile?.location || book.location,
          donorName: profile?.display_name || 'Anonymous',
          donorId: book.user_id,
          status: book.status,
          createdAt: book.created_at,
          photo: book.photo_url
        };
      });

      setBooks(formattedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMyRequests(data || []);

      // Calculate stats
      const totalRequested = data?.length || 0;
      const delivered = data?.filter(r => r.status === 'delivered').length || 0;
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const avgBookPrice = 500; // Average book price estimation

      setStats({
        booksRequested: totalRequested,
        booksReceived: delivered,
        moneySaved: delivered * avgBookPrice,
        activeRequests: pending
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchBooks();
      return;
    }

    const filtered = books.filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.donorName && book.donorName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setBooks(filtered);
  };

  const handleFilter = () => {
    let filtered = books;

    if (filterSubject) {
      filtered = filtered.filter(book => 
        book.subject.toLowerCase() === filterSubject.toLowerCase()
      );
    }

    if (filterGrade) {
      filtered = filtered.filter(book => 
        book.grade === filterGrade
      );
    }

    setBooks(filtered);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterSubject('');
    setFilterGrade('');
    fetchBooks();
    setShowFilters(false);
  };

  const handleBookRequest = async (book: Book) => {
    if (!user) {
      toast.error('Please login to request books');
      return;
    }

    try {
      const { error } = await supabase
        .from('book_requests')
        .insert([{
          user_id: user.id,
          book_id: book.id,
          title: book.title,
          author: '', // Default empty if not provided
          category: book.subject,
          status: 'pending'
        }]);

      if (error) throw error;

      toast.success(`Request sent for "${book.title}"!`);
      fetchMyRequests(); // Refresh requests
    } catch (error: any) {
      console.error('Error requesting book:', error);
      toast.error('Failed to request book. Please try again.');
    }
  };

  const handleViewDetails = (book: Book) => {
    toast.info('View details functionality coming soon');
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button size="lg" onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject</label>
                      <select
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                      >
                        <option value="">All Subjects</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Physics">Physics</option>
                        <option value="Biology">Biology</option>
                        <option value="History">History</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Grade</label>
                      <select
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value)}
                      >
                        <option value="">All Grades</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button onClick={handleFilter} className="flex-1">Apply Filters</Button>
                      <Button onClick={clearFilters} variant="outline">Clear</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Button variant="gradient" asChild>
              <Link to="/books/browse">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse All Books
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/books/requests">
                <Heart className="w-4 h-4 mr-2" />
                My Requests ({myRequests.filter(r => r.status === 'pending' || r.status === 'approved').length} active)
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-gradient border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Books Requested</p>
                  <p className="text-2xl font-bold text-foreground">{stats.booksRequested}</p>
                  <p className="text-xs text-muted-foreground">Total requests made</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-gradient border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Books Received</p>
                  <p className="text-2xl font-bold text-foreground">{stats.booksReceived}</p>
                  <p className="text-xs text-muted-foreground">Successfully received</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-gradient border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Money Saved</p>
                  <p className="text-2xl font-bold text-foreground">₹{stats.moneySaved.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Estimated savings</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-gradient border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Requests</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeRequests}</p>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <Link to="/books/browse">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading books...</div>
                ) : books.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No books available yet</div>
                ) : (
                  <div className="grid gap-6">
                    {books.slice(0, 5).map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onViewDetails={handleViewDetails}
                        onRequest={handleBookRequest}
                        compact
                      />
                    ))}
                  </div>
                )}
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
                {myRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No requests yet</div>
                ) : (
                  <div className="space-y-4">
                     {myRequests.slice(0, 3).map((request) => (
                       <div key={request.id} className="p-4 bg-accent/30 rounded-lg border border-border">
                         <div className="flex items-center justify-between mb-2">
                           <h4 className="font-medium text-sm text-foreground line-clamp-1">{request.title}</h4>
                           <Badge
                             variant="default"
                             className={`text-xs ${
                               request.status === 'pending' 
                                 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                 : request.status === 'approved' 
                                   ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                   : request.status === 'delivered'
                                     ? 'bg-green-100 text-green-800 border-green-200'
                                     : 'bg-red-100 text-red-800 border-red-200'
                             }`}
                           >
                             {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                             {request.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                             {request.status === 'delivered' && <Star className="w-3 h-3 mr-1" />}
                             {request.status}
                           </Badge>
                         </div>
                         <p className="text-sm text-muted-foreground mb-1">
                           {request.author && `by ${request.author}`}
                         </p>
                         <div className="flex items-center justify-between">
                           <p className="text-xs text-muted-foreground">
                             {new Date(request.created_at).toLocaleDateString()}
                           </p>
                           <Badge variant="outline" className="text-xs capitalize">
                             {request.category}
                           </Badge>
                         </div>
                         {request.status === 'approved' && (
                           <div className="mt-2 text-xs text-blue-600 font-medium">
                             ✓ Approved - Arrange pickup/delivery
                           </div>
                         )}
                         {request.status === 'delivered' && (
                           <div className="mt-2 text-xs text-green-600 font-medium">
                             ✓ Book received - Happy learning!
                           </div>
                         )}
                       </div>
                     ))}
                     
                     <Button variant="ghost" size="sm" className="w-full" asChild>
                       <Link to="/books/requests">View All Requests</Link>
                     </Button>
                  </div>
                )}
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
                  <div className="text-3xl font-bold text-primary mb-2">{stats.booksReceived}</div>
                  <p className="text-sm text-muted-foreground">Books Received</p>
                  <p className="text-xs text-muted-foreground mt-1">Total books received</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-2">₹{stats.moneySaved.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-xs text-muted-foreground mt-1">Money not spent on books</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-warning mb-2">{books.length}</div>
                  <p className="text-sm text-muted-foreground">Available Books</p>
                  <p className="text-xs text-muted-foreground mt-1">Books you can request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};