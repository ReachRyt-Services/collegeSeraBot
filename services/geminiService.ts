import { GoogleGenAI, Content, Part, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, BotMode, GroundingMetadata } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBotResponse = async (
  history: Message[],
  newMessage: string,
  mode: BotMode
): Promise<{ text: string; groundingMetadata?: GroundingMetadata }> => {
  try {
    // Convert internal message format to Gemini API format
    const historyContents: Content[] = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text } as Part],
    }));

    let model = 'gemini-2.5-flash';
    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    if (mode === 'search') {
      model = 'gemini-2.5-flash';
      config.tools = [{ googleSearch: {} }];
    } else if (mode === 'thinking') {
      model = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    // Use chat mode to maintain context
    const chat = ai.chats.create({
      model: model,
      history: historyContents,
      config: config,
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: newMessage,
    });

    const text = result.text || "I'm sorry, I couldn't generate a response.";
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    return { text, groundingMetadata };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch response from CollegeSeraBot.");
  }
};
