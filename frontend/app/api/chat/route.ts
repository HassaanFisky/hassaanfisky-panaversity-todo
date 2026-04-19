import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, context, platform, lang } = await req.json();

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_PRIMARY || "";
    
    if (!apiKey) {
      console.error("GROQ_API_KEY is missing in environment.");
      return NextResponse.json({ 
        content: "Cognitive initialization failed: API key missing. Please configure GROQ_API_KEY on Vercel." 
      });
    }

    const systemPrompt = `You are Aira, a high-fidelity AI Intelligence for the Panaversity ${platform || "Todo"} platform. 
    Your tone is sophisticated, analytical, and professional. 
    Current context: ${context || "General UI"}.
    User Language: ${lang || "en"}.
    Keep responses concise (max 120 words).`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-8)
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", response.status, errorText);
      
      // Fallback message
      return NextResponse.json({ 
        content: "I'm having trouble connecting to my core intelligence at the moment. Please try again shortly."
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "Protocol failure: Empty resonance.";

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Aira API Error:", error);
    return NextResponse.json(
      { error: "Internal Synchronicity Error: " + error.message },
      { status: 500 }
    );
  }
}
