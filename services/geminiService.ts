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
      console.error("Edge Function Error Details:", error);
      // Try to parse the error body if it exists in the error object (Supabase specific)
      if ('context' in error && (error as any).context?.json) {
        const body = await (error as any).context.json();
        console.error("Edge Function Error Body:", JSON.stringify(body, null, 2));
      }
      throw new Error(error.message || "Failed to fetch response");
    }

    if (!data) {
      throw new Error("No data received from Edge Function");
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
