import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { MapPin, User, Star, Clock } from 'lucide-react';

export interface Book {
  id: string;
  title: string;
  subject: string;
  grade: string;
  condition: 'excellent' | 'good' | 'fair';
  description?: string;
  photo?: string;
  location: string;
  donorName: string;
  donorId: string;
  status: 'available' | 'requested' | 'donated';
  createdAt: string;
}

interface BookCardProps {
  book: Book;
  onViewDetails?: (book: Book) => void;
  onRequest?: (book: Book) => void;
  showActions?: boolean;
  compact?: boolean;
}

const conditionColors = {
  excellent: 'bg-success text-success-foreground',
  good: 'bg-primary text-primary-foreground',
  fair: 'bg-warning text-warning-foreground',
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onViewDetails,
  onRequest,
  showActions = true,
  compact = false
}) => {
  return (
    <Card className={cn(
      "card-gradient overflow-hidden group cursor-pointer",
      compact ? "h-auto" : "h-full"
    )}
    onClick={() => onViewDetails?.(book)}
    >
      {book.photo && (
        <div className={cn(
          "relative overflow-hidden",
          compact ? "h-32" : "h-48"
        )}>
          <img
            src={book.photo}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge className={conditionColors[book.condition]}>
              {book.condition}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className={compact ? "p-3 pb-2" : "p-4 pb-2"}>
        <div className="space-y-2">
          <h3 className={cn(
            "font-semibold text-foreground group-hover:text-primary transition-colors",
            compact ? "text-sm" : "text-base"
          )}>
            {book.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {book.subject}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Grade {book.grade}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{book.donorName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{book.location}</span>
          </div>
          {!compact && book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {book.description}
            </p>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className={compact ? "p-3 pt-2" : "p-4 pt-2"}>
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size={compact ? "sm" : "default"} 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(book);
              }}
            >
              View Details
            </Button>
            {book.status === 'available' && onRequest && (
              <Button 
                size={compact ? "sm" : "default"}
                onClick={(e) => {
                  e.stopPropagation();
                  onRequest(book);
                }}
              >
                Request
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}