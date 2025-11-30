import React from 'react';
import { Message, College } from '../types';
import { COLLEGE_DATA } from '../constants';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const CollegeDetailCard = ({ college }: { college: College }) => {
  return (
    <div className="mt-3 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-3 bg-muted/30 border-b text-sm font-medium">
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
        {college.name}
      </div>
      <div className="p-3 space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fees</span>
            <p className="font-medium">{college.fees}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</span>
            <p className="font-medium">{college.location}</p>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Courses</span>
          <div className="flex flex-wrap gap-1">
            {college.courses.map(c => (
              <span key={c} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {c}
              </span>
            ))}
          </div>
        </div>
        <a
          href={college.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 w-full mt-1"
        >
          Visit Website
          <ExternalLink className="ml-2 h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

const formatMessageText = (text: string) => {
  if (!text) return null;
  const detectedColleges = COLLEGE_DATA.filter(c => text.includes(c.name));
  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Bold text
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={i} className="min-h-[1.5em] leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
              }
              return <span key={j}>{part}</span>;
            })}
          </div>
        );
      })}

      {detectedColleges.map(college => (
        <CollegeDetailCard key={college.name} college={college} />
      ))}
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const hasGrounding = !!(message as any).groundingMetadata?.groundingChunks?.length;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 mt-1 shrink-0">
        <AvatarFallback>
          {isUser ? 'YO' : 'CB'}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? 'You' : 'CollegeSeraBot'}
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <Card className={`border-none shadow-sm ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
          <CardContent className="p-3 text-sm">
            {formatMessageText(message.text)}

            {hasGrounding && (
              <div className="mt-3 pt-2 border-t border-border/50">
                <p className="text-[10px] font-semibold opacity-70 mb-1 uppercase tracking-wider">Sources</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://www.collegesera.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:underline opacity-90 hover:opacity-100 bg-background/10 px-2 py-1 rounded"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Collegesera
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageBubble;
