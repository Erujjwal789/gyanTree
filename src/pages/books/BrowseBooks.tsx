import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, MapPin, User, Calendar, CheckCircle } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string | null;
  subject: string;
  grade: string;
  condition: string;
  location: string;
  photo_url: string | null;
  description: string | null;
  pickup_delivery: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  location: string | null;
}

interface BookWithDonor extends Book {
  profiles: Profile | null;
}

const BrowseBooks: React.FC = () => {
  const [books, setBooks] = useState<BookWithDonor[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookWithDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRequests, setUserRequests] = useState<string[]>([]); // Track requested book IDs
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const subjects = ['Math', 'Science', 'English', 'History', 'Art', 'Music', 'Other'];
  const grades = ['Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  // Fetch user's requests to prevent duplicates
  const fetchUserRequests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('book_id')
        .eq('user_id', user.id)
        .not('book_id', 'is', null);

      if (error) throw error;
      
      const requestedIds = (data || [])
        .map(r => r.book_id)
        .filter(id => id !== null) as string[];
      
      setUserRequests(requestedIds);
    } catch (error) {
      console.error('Error fetching user requests:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (booksError) {
        console.error('Error fetching books:', booksError);
        toast({
          title: "Error",
          description: "Failed to load books. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Fetch profiles separately to avoid join issues
      const userIds = booksData?.map(book => book.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name, location')
        .in('user_id', userIds);

      // Combine books with profiles
      const booksWithProfiles = booksData?.map(book => ({
        ...book,
        profiles: profilesData?.find(profile => profile.user_id === book.user_id) || null
      })) || [];

      setBooks(booksWithProfiles);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchUserRequests();

    // Set up real-time subscription for new books
    const booksChannel = supabase
      .channel('books-browse')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        () => {
          fetchBooks(); // Refresh when books change
        }
      )
      .subscribe();

    // Subscribe to book requests changes
    const requestsChannel = supabase
      .channel('requests-browse')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_requests',
          filter: user ? `user_id=eq.${user.id}` : undefined
        },
        () => {
          fetchUserRequests(); // Refresh user's requests
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(booksChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [user]);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, subjectFilter, gradeFilter, conditionFilter]);

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter && subjectFilter !== 'all') {
      filtered = filtered.filter(book => book.subject === subjectFilter);
    }

    if (gradeFilter && gradeFilter !== 'all') {
      filtered = filtered.filter(book => book.grade === gradeFilter);
    }

    if (conditionFilter && conditionFilter !== 'all') {
      filtered = filtered.filter(book => book.condition === conditionFilter);
    }

    setFilteredBooks(filtered);
  };

  const handleRequestBook = async (book: BookWithDonor) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to request a book.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Check if already requested
    if (userRequests.includes(book.id)) {
      toast({
        title: "Already Requested",
        description: "You have already requested this book.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('book_requests')
        .insert([{
          user_id: user.id,
          book_id: book.id,
          title: book.title,
          author: book.author || 'Unknown',
          category: book.subject.toLowerCase(),
          status: 'pending'
        }]);

      if (error) throw error;

      // Update local state
      setUserRequests(prev => [...prev, book.id]);

      toast({
        title: "Request Sent! 📚",
        description: `Your request for "${book.title}" has been sent to the donor.`,
      });
    } catch (error) {
      console.error('Error requesting book:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSubjectFilter('all');
    setGradeFilter('all');
    setConditionFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Browse Books</h1>
        <p className="text-muted-foreground">Discover books donated by our community</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Books
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title, author, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {conditions.map(condition => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || (subjectFilter !== 'all') || (gradeFilter !== 'all') || (conditionFilter !== 'all')
                ? 'Try adjusting your search criteria or filters'
                : 'No books have been donated yet. Check back later!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              {book.photo_url && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img 
                    src={book.photo_url} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="flex-shrink-0">
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                {book.author && (
                  <p className="text-sm text-muted-foreground">by {book.author}</p>
                )}
              </CardHeader>
              
              <CardContent className="flex-grow space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{book.subject}</Badge>
                  <Badge variant="outline">{book.grade}</Badge>
                  <Badge variant="outline">{book.condition}</Badge>
                </div>

                {book.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {book.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      Donated by {book.profiles?.display_name || 'Anonymous'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{book.location}</span>
                  </div>

                  {book.pickup_delivery && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{book.pickup_delivery}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <div className="p-6 pt-0">
                {userRequests.includes(book.id) ? (
                  <Button 
                    className="w-full"
                    variant="secondary"
                    disabled
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Requested
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleRequestBook(book)}
                    className="w-full"
                    disabled={!user}
                  >
                    {!user ? 'Login to Request' : 'Request Book'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseBooks;