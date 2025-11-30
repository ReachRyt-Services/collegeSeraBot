import { GoogleGenerativeAI } from "@google/generative-ai";

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
      throw new Error('GEMINI_API_KEY is not set in Edge Function secrets');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Determine model
    let modelName = 'gemini-1.5-flash';
    if (mode === 'thinking') {
      // Fallback to flash if thinking model not available or stable
      modelName = 'gemini-1.5-flash';
    }

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: "You are CollegeSeraBot, a helpful assistant for college admission queries.",
    });

    // Convert history to Gemini format
    // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(newMessage);
    const response = await result.response;
    const text = response.text();

    // Note: groundingMetadata might be different or require specific config in this SDK
    // For now, we'll omit it to ensure stability, or check if response.candidates exists
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return new Response(
      JSON.stringify({ text, groundingMetadata }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error: any) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, details: error.toString() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
