export interface College {
  name: string;
  fees: string;
  courses: string[];
  website: string;
  location: string;
}

export interface User {
  id?: string; // UUID from Supabase
  created_at?: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  preferred_college?: string;
  preferred_course?: string;
  program?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingMetadata?: GroundingMetadata;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
}

export type BotMode = 'search' | 'thinking';

export interface InteractionLog {
  user_id: string;
  message: string;
  bot_response: string;
  detected_colleges: string[];
}