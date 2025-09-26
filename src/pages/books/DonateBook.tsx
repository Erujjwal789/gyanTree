import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, MapPin, Upload, Camera } from 'lucide-react';

interface DonateBookForm {
  title: string;
  author: string;
  subject: string;
  grade: string;
  condition: string;
  description: string;
  location: string;
  pickupDelivery: string;
  photo?: FileList;
}

export const DonateBook: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DonateBookForm>({
    defaultValues: {
      title: '',
      author: '',
      subject: '',
      grade: '',
      condition: '',
      description: '',
      location: user?.location || '',
      pickupDelivery: 'pickup',
    }
  });

  const onSubmit = async (data: DonateBookForm) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to donate a book.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create book object for database
      const bookData = {
        user_id: user.id,
        title: data.title,
        author: data.author || null,
        subject: data.subject,
        grade: data.grade,
        condition: data.condition,
        description: data.description || null,
        location: data.location,
        pickup_delivery: data.pickupDelivery,
        photo_url: data.photo?.[0]?.name || null, // In real app, this would be uploaded to storage
        status: 'available'
      };

      // Insert book into database
      const { error } = await supabase
        .from('books')
        .insert([bookData]);

      if (error) {
        throw error;
      }
      
      toast({
        title: "Book Donated Successfully! 🎉",
        description: `"${data.title}" has been added to your donations and is now available for students.`,
      });

      // Reset form and navigate back
      form.reset();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting book:', error);
      toast({
        title: "Donation Failed",
        description: "There was an error submitting your book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Donate a Book</h1>
          <p className="text-muted-foreground">
            Share knowledge and help students in need by donating your books
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Book Information
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
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Author</FormLabel>
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

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  rules={{ required: 'Subject is required' }}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
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
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grade */}
                <FormField
                  control={form.control}
                  name="grade"
                  rules={{ required: 'Grade/Class is required' }}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Grade/Class *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade/class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Class 1</SelectItem>
                            <SelectItem value="2">Class 2</SelectItem>
                            <SelectItem value="3">Class 3</SelectItem>
                            <SelectItem value="4">Class 4</SelectItem>
                            <SelectItem value="5">Class 5</SelectItem>
                            <SelectItem value="6">Class 6</SelectItem>
                            <SelectItem value="7">Class 7</SelectItem>
                            <SelectItem value="8">Class 8</SelectItem>
                            <SelectItem value="9">Class 9</SelectItem>
                            <SelectItem value="10">Class 10</SelectItem>
                            <SelectItem value="11">Class 11</SelectItem>
                            <SelectItem value="12">Class 12</SelectItem>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="postgraduate">Postgraduate</SelectItem>
                            <SelectItem value="competitive">Competitive Exams</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Condition */}
                <FormField
                  control={form.control}
                  name="condition"
                  rules={{ required: 'Book condition is required' }}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Book Condition *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select book condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent - Like new</SelectItem>
                            <SelectItem value="good">Good - Minor wear</SelectItem>
                            <SelectItem value="fair">Fair - Noticeable wear but readable</SelectItem>
                            <SelectItem value="poor">Poor - Heavy wear but usable</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    rules={{ required: 'Location is required' }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <InputField
                            {...field}
                            icon={<MapPin className="w-4 h-4" />}
                            placeholder="Enter your city/location"
                            error={fieldState.error?.message}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pickup/Delivery */}
                  <FormField
                    control={form.control}
                    name="pickupDelivery"
                    rules={{ required: 'Pickup/delivery option is required' }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Pickup/Delivery *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pickup">Pickup Only</SelectItem>
                              <SelectItem value="delivery">Delivery Available</SelectItem>
                              <SelectItem value="both">Both Pickup & Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any additional details about the book..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload */}
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Book Photo (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <input
                            {...field}
                            type="file"
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files)}
                            className="hidden"
                            id="book-photo"
                          />
                          <label
                            htmlFor="book-photo"
                            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            Upload Photo
                          </label>
                          {value && value.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {value[0].name}
                            </span>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Donating...
                      </>
                    ) : (
                      'Donate Book'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};