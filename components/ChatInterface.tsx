import React, { useState, useRef, useEffect } from 'react';
import { Message, LoadingState, User, BotMode } from '../types';
import { generateBotResponse } from '../services/geminiService';
import { logInteraction } from '../services/dataService';
import MessageBubbleCaramel from './MessageBubble';
import Ai04 from './Ai04';

interface ChatInterfaceProps {
  user: User;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
  const [mode, setMode] = useState<BotMode>('search');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Namaste ${user.name}! I am CollegeSeraBot. I can help you with fees, courses, and admission details for top colleges. Which colleges or programs are you looking for today?`,
      timestamp: new Date(),
    },
  ]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  // refs
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll helper (only if user is near bottom)
  const shouldAutoScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom < 150; // px threshold
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (shouldAutoScroll()) scrollToBottom('smooth');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // send flow used by Ai04
  const sendPrompt = async (userMessageText: string) => {
    if (!userMessageText?.trim() || status === LoadingState.LOADING) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setStatus(LoadingState.LOADING);

    try {
      const response = await generateBotResponse(messages, userMessageText, mode);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        groundingMetadata: response.groundingMetadata,
      };

      setMessages((prev) => [...prev, botMessage]);
      setStatus(LoadingState.IDLE);

      if (user.id) {
        logInteraction({
          user_id: user.id,
          message: userMessageText,
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
      setMessages((prev) => [...prev, errorMessage]);
      setStatus(LoadingState.ERROR);
    }
  };

  // small inline caramel variables (keeps no global css required)
  const themeCss = `
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
    }
  `;

  return (
    // responsive container:
    // - full height available (parent must provide height; App now does)
    // - center horizontally; wider on desktop (max-w-6xl)
    <div className="mx-auto w-full max-w-6xl h-full flex flex-col" style={{ minHeight: 0 }}>
      <style>{themeCss}</style>

      {/* top small header area (inside chat) */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(95,49,29,0.06)', background: 'var(--caramel-50)' }}>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold" style={{ color: 'var(--caramel-800)' }}>CollegeSeraBot</div>
          <div className="text-xs opacity-70">Ask about fees, courses & cutoffs</div>
        </div>
      </div>

      {/* messages area: flex-1 so it expands and is scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ background: 'linear-gradient(180deg,var(--caramel-50), #fffaf6)' }}
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubbleCaramel key={msg.id} message={msg} />
          ))}

          {status === LoadingState.LOADING && (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full" style={{ background: 'var(--caramel-300)' }} />
              </div>
              <div className="chat-bubble car-bubble">
                <div className="skeleton h-4 w-24"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* input/prompt pinned to bottom (Ai04) */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(95,49,29,0.06)', background: '#fff' }}>
        <Ai04 onSubmit={(promptText) => sendPrompt(promptText)} />
      </div>
    </div>
  );
};

export default ChatInterface;
