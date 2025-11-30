import React from 'react';
import { Message, College } from '../types';
import { COLLEGE_DATA } from '../constants';

interface MessageBubbleProps {
  message: Message;
}

const CollegeDetailCard = ({ college }: { college: College }) => {
  return (
    <div className="collapse collapse-arrow border border-base-300 bg-car-50 rounded-box mt-2 shadow-sm">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-sm font-bold text-car-primary peer-checked:bg-car-100/60 py-3 min-h-0 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.585 51.759 51.759 0 0 1-2.658.813m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
        Show Details: {college.name}
      </div>
      <div className="collapse-content bg-car-25/40 text-xs">
        <div className="pt-3 space-y-3">
            <div className="grid grid-cols-1 gap-2">
                <div className="p-2 bg-car-0 rounded border border-car-100">
                    <span className="font-bold block opacity-60 text-[10px] uppercase tracking-wider">Estimated Fees</span>
                    <span className="font-medium">{college.fees}</span>
                </div>
                <div className="p-2 bg-car-0 rounded border border-car-100">
                    <span className="font-bold block opacity-60 text-[10px] uppercase tracking-wider">Location</span>
                    <span className="font-medium">{college.location}</span>
                </div>
            </div>
            <div>
                <span className="font-bold block opacity-60 text-[10px] uppercase tracking-wider mb-1">Key Courses</span>
                <div className="flex flex-wrap gap-1">
                    {college.courses.map(c => (
                        <span key={c} className="badge badge-xs badge-outline" style={{ borderColor: 'rgba(95,49,29,0.15)', color: 'var(--caramel-800)' }}>{c}</span>
                    ))}
                </div>
            </div>
            <div className="pt-1">
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="btn btn-xs w-full" style={{ backgroundColor: 'var(--caramel-600)', color: 'white' }}>
                    Visit Official Website
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

const formatMessageText = (text: string) => {
  if (!text) return null;

  // Detect if the message contains any college names from our data
  const detectedColleges = COLLEGE_DATA.filter(c => text.includes(c.name));

  // Split by newlines to handle block structuring
  const lines = text.split('\n');

  return (
    <div className="w-full">
      <div className="space-y-1 text-sm md:text-base">
        {lines.map((line, lineIdx) => {
          // Check for list items (lines starting with * or - followed by space)
          const listMatch = line.match(/^(\s*)([\*\-])\s+(.*)/);
          const isListItem = !!listMatch;
          const content = isListItem ? listMatch[3] : line;

          // Regex to capture bold text (**...**) OR URLs (http://... or https://...)
          const parts = content.split(/(\*\*.*?\*\*)|(https?:\/\/[^\s]+)/g).filter(part => part !== undefined);

          const formattedContent = parts.map((part, partIdx) => {
            // Handle Bold
            if (part && part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
              return <strong key={partIdx} className="font-bold">{part.slice(2, -2)}</strong>;
            }

            // Handle URLs
            if (part && part.match(/^https?:\/\//)) {
              return (
                <a 
                  key={partIdx} 
                  href={part} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="link link-hover break-all"
                  style={{ color: 'var(--caramel-700)', textDecoration: 'underline' }}
                >
                  {part}
                </a>
              );
            }

            // Plain text
            return <span key={partIdx}>{part}</span>;
          });

          if (isListItem) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 ml-2">
                 <span className="mt-2 w-2 h-2 bg-current rounded-full flex-shrink-0 opacity-80" style={{ color: 'var(--caramel-600)' }} />
                 <span>{formattedContent}</span>
              </div>
            );
          }

          // Render empty lines as spacing
          if (!line.trim()) {
             return <div key={lineIdx} className="h-2" />;
          }

          return <div key={lineIdx} className="min-h-[1.2em]">{formattedContent}</div>;
        })}
      </div>

      {/* Render Structured College Data if detected */}
      {detectedColleges.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {detectedColleges.map(college => (
            <CollegeDetailCard key={college.name} college={college} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MessageBubbleCaramel: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const hasGrounding = !!(message as any).groundingMetadata?.groundingChunks?.length;

  // small local palette
  const css = `
    :root {
      --caramel-50: #fff9f4;
      --caramel-100: #fff2e6;
      --caramel-200: #fde1cc;
      --caramel-300: #f9ccb3;
      --caramel-400: #f4b28a;
      --caramel-500: #e89a61;
      --caramel-600: #c97a3f;
      --caramel-700: #8f4f2a;
      --caramel-800: #5f311d;
      --caramel-900: #371810;
    }

    .car-root { background: linear-gradient(180deg, var(--caramel-50), #fffaf6); }
    .car-bubble { background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,250,246,0.8)); border: 1px solid rgba(95,49,29,0.06); }
  `;

  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'} car-root`}>
      <style>{css}</style>

      <div className="chat-image avatar">
        <div className="w-10 rounded-full border" style={{ borderColor: 'rgba(95,49,29,0.12)', background: isUser ? 'linear-gradient(135deg,var(--caramel-100),var(--caramel-200))' : 'linear-gradient(135deg,var(--caramel-300),var(--caramel-50))', padding: 6 }}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" style={{ color: 'var(--caramel-600)' }}>
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" style={{ color: 'var(--caramel-700)' }}>
              <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436h.021l-3.472 8.1a.75.75 0 0 1-1.38 0l-3.472-8.1h.022C4.183 11.805 1.8 7.305 1.8 2.25a.75.75 0 0 1 .75-.75c5.055 0 9.555 2.383 12.436 6.084l-.676.676ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      <div className="chat-header opacity-50 text-xs mb-1">
        {isUser ? 'You' : 'Vidyalaya Bot'}
      </div>

      <div className={`chat-bubble ${isUser ? 'chat-bubble-primary' : 'car-bubble'} shadow-md flex flex-col gap-2 max-w-[85%] md:max-w-[75%] overflow-y-auto max-h-[70vh]`}>
        {formatMessageText(message.text)}

        {hasGrounding && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(95,49,29,0.06)' }}>
            <p className="font-bold mb-1 opacity-70" style={{ color: 'var(--caramel-800)' }}>Sources:</p>
            <ul className="space-y-1">
              <li>
                <a 
                  href="https://www.collegesera.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link link-hover opacity-90 hover:opacity-100 flex items-center gap-1"
                  style={{ color: 'var(--caramel-700)' }}
                >
                  <span className="truncate max-w-[200px]">Collegesera</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3" style={{ color: 'var(--caramel-700)' }}>
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="chat-footer opacity-50 text-xs mt-1">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default MessageBubbleCaramel;
