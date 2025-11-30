import { GoogleGenAI } from "@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { history, newMessage, mode } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Convert internal message format to Gemini API format
    const historyContents = history.map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    let modelName = 'gemini-2.5-flash';
    const config: any = {
      systemInstruction: "You are CollegeSeraBot, a helpful assistant for college admission queries.",
    };

    if (mode === 'search') {
      modelName = 'gemini-2.5-flash';
      config.tools = [{ googleSearch: {} }];
    } else if (mode === 'thinking') {
      modelName = 'gemini-2.0-flash-thinking-exp-01-21';
    }

    const chat = ai.chats.create({
      model: modelName,
      history: historyContents,
      config: config,
    });

    const result = await chat.sendMessage({
      message: newMessage,
    });

    const text = result.text || "I'm sorry, I couldn't generate a response.";
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;

    return new Response(
      JSON.stringify({ text, groundingMetadata }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
