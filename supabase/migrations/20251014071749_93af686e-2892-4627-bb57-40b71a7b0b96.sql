-- Add book_id column to book_requests table to link requests to specific books
ALTER TABLE public.book_requests 
ADD COLUMN IF NOT EXISTS book_id uuid REFERENCES public.books(id) ON DELETE SET NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_book_requests_book_id ON public.book_requests(book_id);

-- Add comment to explain the column
COMMENT ON COLUMN public.book_requests.book_id IS 'Reference to the specific book being requested (optional, for requests about specific available books)';