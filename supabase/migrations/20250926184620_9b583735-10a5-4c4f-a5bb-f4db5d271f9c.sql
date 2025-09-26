-- Create book_requests table
CREATE TABLE public.book_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.book_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for book_requests
CREATE POLICY "Users can view all book requests" 
ON public.book_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own requests" 
ON public.book_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" 
ON public.book_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests" 
ON public.book_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_book_requests_updated_at
BEFORE UPDATE ON public.book_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update books table to add author field and pickup/delivery options
ALTER TABLE public.books 
ADD COLUMN author TEXT,
ADD COLUMN pickup_delivery TEXT DEFAULT 'pickup';

-- Add indexes for better performance
CREATE INDEX idx_book_requests_user_id ON public.book_requests(user_id);
CREATE INDEX idx_book_requests_status ON public.book_requests(status);
CREATE INDEX idx_books_author ON public.books(author);
CREATE INDEX idx_books_pickup_delivery ON public.books(pickup_delivery);