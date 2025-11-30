import React, { useState, useRef, useEffect } from 'react';
import { Message, LoadingState, User, BotMode } from '../types';
import { generateBotResponse } from '../services/geminiService';
import { logInteraction } from '../services/dataService';
import MessageBubble from './MessageBubble';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, Paperclip, Sparkles, ChevronDown } from 'lucide-react';

interface ChatInterfaceProps {
  user: User;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Namaste ${user.name}! I am CollegeSeraBot. I can help you with fees, courses, and admission details for top colleges. Which colleges or programs are you looking for today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || status === LoadingState.LOADING) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus(LoadingState.LOADING);

    try {
      const response = await generateBotResponse(messages, userMessage.text, 'search');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        groundingMetadata: response.groundingMetadata,
      };

      setMessages(prev => [...prev, botMessage]);
      setStatus(LoadingState.IDLE);

      if (user.id) {
        logInteraction({
          user_id: user.id,
          message: userMessage.text,
          bot_response: response.text,
          detected_colleges: [],
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered an error connecting to the server. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setStatus(LoadingState.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarFallback>CB</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold flex items-center gap-2">
              CollegeSeraBot
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">BETA</span>
            </div>
            <div className="text-xs text-muted-foreground">Ask about fees, courses & cutoffs</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {status === LoadingState.LOADING && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 border mt-1">
              <AvatarFallback>CB</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Card className="p-4 w-fit bg-muted/50 border-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>Thinking...</span>
                </div>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="relative flex items-end gap-2 p-2 rounded-xl border bg-muted/30 focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-lg">
            <Paperclip className="h-5 w-5" />
          </Button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about colleges..."
            className="flex-1 min-h-[44px] max-h-[200px] w-full bg-transparent border-none focus:ring-0 resize-none py-2.5 text-sm placeholder:text-muted-foreground"
            style={{ height: 'auto', overflow: 'hidden' }}
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || status === LoadingState.LOADING}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-center">
          <p className="text-[10px] text-muted-foreground">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
