import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MessageSquare, User, Calendar, Plus, Search, Filter } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type BookRequest = Tables<'book_requests'>;

interface RequestBookForm {
  title: string;
  author: string;
  category: string;
  reason: string;
}

export const BookRequests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'fulfilled'>('all');
  
  const form = useForm<RequestBookForm>({
    defaultValues: {
      title: '',
      author: '',
      category: '',
      reason: '',
    }
  });

  // Handle prefilled data from navigation state
  useEffect(() => {
    if (location.state?.prefilledTitle) {
      form.setValue('title', location.state.prefilledTitle);
      setShowRequestForm(true);
    }
  }, [location.state, form]);

  // Fetch book requests
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load book requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onSubmit = async (data: RequestBookForm) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to request a book.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('book_requests')
        .insert([{
          user_id: user.id,
          title: data.title,
          author: data.author,
          category: data.category,
          reason: data.reason || null,
          status: 'pending'
        }]);

      if (error) throw error;
      
      toast({
        title: "Request Submitted! 📚",
        description: `Your request for "${data.title}" has been posted.`,
      });

      form.reset();
      setShowRequestForm(false);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fulfilled': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Requests</h1>
          <p className="text-muted-foreground">
            Request books you need or help fulfill others' requests
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Request a Book
          </Button>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Request Form */}
        {showRequestForm && (
          <Card className="mb-8 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Request a Book
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      rules={{ required: 'Book title is required' }}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Book Title *</FormLabel>
                          <FormControl>
                            <InputField
                              {...field}
                              placeholder="Enter the book title"
                              error={fieldState.error?.message}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Author */}
                    <FormField
                      control={form.control}
                      name="author"
                      rules={{ required: 'Author is required' }}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Author *</FormLabel>
                          <FormControl>
                            <InputField
                              {...field}
                              placeholder="Enter the author name"
                              error={fieldState.error?.message}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    rules={{ required: 'Category is required' }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="hindi">Hindi</SelectItem>
                              <SelectItem value="social-science">Social Science</SelectItem>
                              <SelectItem value="computer-science">Computer Science</SelectItem>
                              <SelectItem value="physics">Physics</SelectItem>
                              <SelectItem value="chemistry">Chemistry</SelectItem>
                              <SelectItem value="biology">Biology</SelectItem>
                              <SelectItem value="history">History</SelectItem>
                              <SelectItem value="geography">Geography</SelectItem>
                              <SelectItem value="literature">Literature</SelectItem>
                              <SelectItem value="competitive-exams">Competitive Exams</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reason */}
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Request (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Why do you need this book? This helps donors prioritize requests..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? "No book requests have been made yet." 
                    : `No ${filter} requests found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="shadow-soft hover:shadow-elegant transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1">
                            {request.title}
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            by {request.author}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Student Request
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {request.category.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {request.reason && (
                        <div className="bg-accent/50 rounded-lg p-4 mb-4">
                          <p className="text-sm text-foreground">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      
                      {user?.role === 'donor' && request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                          <Button size="sm">
                            I Can Help
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};