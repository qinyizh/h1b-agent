// app/api/wiki/quick-def/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ⚠️ 记得去 .env.local 文件里填上 GOOGLE_API_KEY=你的密钥
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Please set GOOGLE_API_KEY in .env.local file." },
        { status: 500 }
      );
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // System prompt with strict constraints
    const systemInstruction = `
# Role
You are an academic immigration lexicon implementation.

# Task
Define the user's search term directly and concisely within the context of US immigration.

# Constraints
1. Maximum 3 sentences.
2. Tone: "Academic Zen" (objective, formal, precise).
3. NO conversational filler ("Sure, I can define that...", "Let me explain..."). Start directly with the definition.
4. If the term is completely unrelated to US immigration (e.g., "banana", "cooking recipes"), return exactly: "此条目似乎与美国移民无关。"

# Output Format
Provide only the definition text, no additional formatting or explanations.
`;

    // Use gemini-1.5-flash for lowest cost and fastest speed
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(query.trim());
    const response = result.response.text();

    return NextResponse.json({ definition: response });

  } catch (error) {
    console.error("Wiki Quick Def API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate definition", details: errorMessage },
      { status: 500 }
    );
  }
}

