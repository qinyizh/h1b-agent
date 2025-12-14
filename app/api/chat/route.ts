import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
interface ChatMessage {
    role: string;
    text?: string;                 // 前端可能传这个
    parts?: { text: string }[];    // 或者传这个
}
// ---------------------------------------------------------
// 🚀 性能优化：全局单例缓存
// 即使 Next.js 热重载，这个 global 变量也不会被轻易清空
// ---------------------------------------------------------
// 1. 全局缓存 (类型修复版)
// ---------------------------------------------------------
// 这里的技巧是：把 global 当作 any 类型，TypeScript 就不管你了
// ---------------------------------------------------------
function getKnowledgeBase() {
  const globalWithCache = global as unknown as { _knowledgeCache?: string };

  if (globalWithCache._knowledgeCache) {
    return globalWithCache._knowledgeCache;
  }

  const knowledgeDir = path.join(process.cwd(), 'data/knowledge');
  
  try {
    const files = fs.readdirSync(knowledgeDir).filter(file => file.endsWith('.txt'));
    
    let allContent = "";
    files.forEach(file => {
      const filePath = path.join(knowledgeDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const urlMatch = content.match(/Source(?: URL)?: (https?:\/\/[^\s]+)/i);
      const sourceName = urlMatch ? urlMatch[1] : file.replace('.txt', '.pdf');

      const compressedContent = content.replace(/\n\s*\n/g, '\n').trim();

      allContent += `
<document source="${sourceName}">
${compressedContent}
</document>\n\n`;
    });

    // 存入缓存
    globalWithCache._knowledgeCache = allContent;
    return allContent;

  } catch (error) {
    console.error("❌ 读取失败:", error);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    // 获取知识 (这次是毫秒级的)
    const lawContext = getKnowledgeBase();
    // 1. 动态获取今天的时间 (格式: YYYY-MM-DD)
    const today = new Date().toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedHistory = (history || []).map((msg: ChatMessage) => {
    // 这里的逻辑是：不管前端传的是 text 还是 parts，我都把它修成 parts
    let textContent = "";
    
    if (typeof msg.text === 'string') {
        textContent = msg.text; // 简单格式
    } else if (Array.isArray(msg.parts) && msg.parts[0] && msg.parts[0].text) {
        textContent = msg.parts[0].text; // SDK 格式
    }

    return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: textContent }] // 强制包装成 SDK 需要的格式
    };
    });

    // 3. 去除开头的 Model 废话 (Gemini 必须由 User 开头)
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
    formattedHistory.shift();
    }

    // 4. 截取最近 10 条 (保留上下文但不超载)
    const recentHistory = formattedHistory.slice(-10);

    const systemInstruction = `
    # Role
    Senior US Immigration Consultant (Specializing in NIW, H1B, and Travel Compliance).

    # Current Context
    - **Today's Date:** ${today}
    - **User Input:** Analyze the user's specific case details.
    
    # Knowledge Base
    The user has provided legal documents wrapped in <document source="..."> tags.
    ${lawContext}
    
    
    # Citation Rules (CRITICAL)
    1. **Facts must be grounded:** Every time you state a specific legal fact, criteria, or policy date, you MUST cite the source.
    2. **Format:** - If the source is a URL (starts with http), format it as a Markdown link: **[Source](URL)**.
       - If the source is a filename, format it as bold text: **(Source: Filename)**.
    3. **Placement:** Place the citation immediately after the relevant sentence or at the end of the paragraph.
    
    # General Rules
    1. Tone: Professional, concise, reassuring.
    2. Language: Chinese (Simplified).
    3. If the user asks about something NOT in the Knowledge Base, admit you don't know based on current files.
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite", 
      systemInstruction: systemInstruction 
    });

    const chat = model.startChat({
      history: recentHistory,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ reply: response });

  } catch (error: unknown) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { error: "AI Error", details: errorMessage }, 
      { status: 500 }
    );
  }
}