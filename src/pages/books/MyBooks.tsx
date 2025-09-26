import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Plus, Eye, Edit2, Trash2, MessageCircle, MapPin, Clock } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  subject: string;
  grade: string;
  condition: string;
  location: string;
  description?: string;
  status: 'available' | 'requested' | 'donated';
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// Remove mock data - books are now fetched from database

const getStatusBadge = (status: Book['status']) => {
  const statusConfig = {
    available: { variant: 'secondary' as const, label: 'Available' },
    requested: { variant: 'default' as const, label: 'Requested' },
    donated: { variant: 'outline' as const, label: 'Donated' }
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getConditionColor = (condition: string) => {
  const colors = {
    excellent: 'text-emerald-600',
    good: 'text-blue-600',
    fair: 'text-amber-600',
    poor: 'text-red-600'
  };
  return colors[condition as keyof typeof colors] || 'text-muted-foreground';
};

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
  return (
    <Card className="hover:shadow-medium transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {getStatusBadge(book.status)}
              <Badge variant="outline">{book.subject}</Badge>
              <Badge variant="outline">Class {book.grade}</Badge>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{book.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Uploaded on {new Date(book.created_at).toLocaleDateString()}</span>
          </div>
          <div>
            <span>Condition: </span>
            <span className={`font-medium capitalize ${getConditionColor(book.condition)}`}>
              {book.condition}
            </span>
          </div>
        </div>

        {book.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {book.description}
          </p>
        )}

        {book.status === 'available' && (
          <Button variant="outline" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Available for Request
          </Button>
        )}

        {book.status === 'requested' && (
          <Button variant="default" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Manage Requests
          </Button>
        )}

        {book.status === 'donated' && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-3">
            <p className="text-sm text-success-foreground">
              <span className="font-medium">Successfully donated!</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const MyBooks: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBooks();
  }, [user]);

  const fetchUserBooks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks((data || []) as Book[]);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your books...</p>
        </div>
      </div>
    );
  }

  const availableBooks = books.filter(book => book.status === 'available');
  const requestedBooks = books.filter(book => book.status === 'requested');
  const donatedBooks = books.filter(book => book.status === 'donated');

  const stats = {
    total: books.length,
    available: availableBooks.length,
    requested: requestedBooks.length,
    donated: donatedBooks.length,
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Books</h1>
            <p className="text-muted-foreground">
              Manage your donated books and track their status
            </p>
          </div>
          <Button 
            variant="gradient" 
            onClick={() => navigate('/donate-book')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Donate New Book
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Books</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.available}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">{stats.requested}</div>
              <div className="text-sm text-muted-foreground">Requested</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.donated}</div>
              <div className="text-sm text-muted-foreground">Donated</div>
            </CardContent>
          </Card>
        </div>

        {/* Books Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Books ({stats.total})</TabsTrigger>
            <TabsTrigger value="available">Available ({stats.available})</TabsTrigger>
            <TabsTrigger value="requested">Requested ({stats.requested})</TabsTrigger>
            <TabsTrigger value="donated">Donated ({stats.donated})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {books.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No books uploaded yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start sharing knowledge by donating your first book
                  </p>
                  <Button variant="gradient" onClick={() => navigate('/donate-book')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Donate Your First Book
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requested" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requestedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="donated" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donatedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};