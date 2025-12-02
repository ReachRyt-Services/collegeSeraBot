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
    let modelName = 'gemini-2.0-flash';
    if (mode === 'thinking') {
      // Fallback to flash if thinking model not available or stable
      modelName = 'gemini-2.0-flash';
    }

    // College Data Context
    const COLLEGE_DATA = [
      {
        name: "IIT Madras",
        fees: "Approx. ₹2-3 Lakhs per year (varies by category)",
        courses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Aerospace", "Civil Engineering"],
        website: "https://www.iitm.ac.in",
        location: "Chennai, Tamil Nadu"
      },
      {
        name: "VIT Vellore",
        fees: "Approx. ₹1.98 - 7.8 Lakhs per year (based on category)",
        courses: ["CSE", "ECE", "IT", "Mechanical", "Biotech"],
        website: "https://vit.ac.in",
        location: "Vellore, Tamil Nadu"
      },
      {
        name: "SRM Institute of Science and Technology",
        fees: "Approx. ₹2.5 - 4.5 Lakhs per year",
        courses: ["CSE", "ECE", "Robotics", "Artificial Intelligence", "Cyber Security"],
        website: "https://www.srmist.edu.in",
        location: "Kattankulathur, Tamil Nadu"
      }
    ];

    const SYSTEM_PROMPT = `
    You are CollegeSeraBot, a helpful assistant for Indian college inquiries.
    
    CRITICAL INSTRUCTION:
    You have access to the following specific college data:
    ${JSON.stringify(COLLEGE_DATA)}

    RULES:
    1. If a user asks about the FEES, COURSES, or LOCATION of any college in this list, you MUST provide the exact information from the data above.
    2. For colleges NOT in this list, YOU MUST USE YOUR GOOGLE SEARCH TOOL to find the latest fee structure, courses, and location.
    3. DO NOT tell the user to "check the website" or "contact officials" if you can find the answer via search.
    4. Provide specific numbers (e.g., "Approx. ₹2.5 Lakhs") whenever found.
    5. Be polite, concise, and helpful.
    `;

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
    });

    // Convert history to Gemini format
    // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
    let chatHistory = history.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // Sanitize history: Gemini requires the first message to be from the user
    // We remove any leading model messages (like the welcome message)
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift();
    }

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
