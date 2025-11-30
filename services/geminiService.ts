import { supabase } from './supabaseClient';
import { Message, BotMode, GroundingMetadata } from '../types';

export const generateBotResponse = async (
  history: Message[],
  newMessage: string,
  mode: BotMode
): Promise<{ text: string; groundingMetadata?: GroundingMetadata }> => {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        history,
        newMessage,
        mode
      }
    });

    if (error) {
      console.error("Edge Function Error:", error);
      throw new Error(error.message || "Failed to fetch response");
    }

    return {
      text: data.text,
      groundingMetadata: data.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw new Error("Failed to fetch response from CollegeSeraBot.");
  }
};
