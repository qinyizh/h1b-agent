// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ⚠️ 记得去 .env.local 文件里填上 GOOGLE_API_KEY=你的密钥
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// 简单缓存，防止每次对话都去读硬盘，提升速度
let cachedContext: string | null = null;

function getKnowledgeBase() {
  if (cachedContext) return cachedContext;

  const knowledgeDir = path.join(process.cwd(), 'data/knowledge');
  
  try {
    // 1. 扫描目录下的所有 .txt 文件
    const files = fs.readdirSync(knowledgeDir).filter(file => file.endsWith('.txt'));
    
    if (files.length === 0) {
      console.warn("⚠️ 警告: 知识库里没有 .txt 文件，AI 将无法引用法律条文。");
      return "";
    }

    // 2. 拼接所有文件内容
    let allContent = "";
    files.forEach(file => {
      const filePath = path.join(knowledgeDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      allContent += `\n\n=== Document: ${file} ===\n${content}`;
    });

    cachedContext = allContent;
    console.log(`🧠 成功加载知识库: ${files.length} 个文件`);
    return allContent;

  } catch (error) {
    console.error("❌ 读取知识库失败:", error);
    return "";
  }
}

export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured. Please set GOOGLE_API_KEY in .env.local file." },
        { status: 500 }
      );
    }

    const { message, history } = await req.json();
    
    // 1. 获取法律知识
    const lawContext = getKnowledgeBase();

    // 2. 构建超级人设 (System Prompt)
    const systemInstruction = `
    # Role
    你是一名精通美国移民法(INA)的资深顾问，专长于 NIW (国家利益豁免)。
    
    # Knowledge Base (法律依据)
    ${lawContext}
    
    # Rules
    1. **依据优先:** 回答必须基于上方的 Knowledge Base。如果知识库里有相关条文，请隐晦地提及（例如"根据 Dhanasar 判例..."）。
    2. **诚实原则:** 如果 Knowledge Base 里没提到的细节，不要瞎编，可以说"根据目前掌握的判例库，尚无明确规定..."。
    3. **语言风格:** "Academic Zen" (学术、冷静、客观)。不要用夸张的感叹号。
    4. **格式:** 使用 Markdown 格式优化阅读体验。
    `;

    // 3. 转换历史记录格式 (组件格式 -> Gemini格式)
    type HistoryMessage = { role: string; text?: string; content?: string; parts?: Array<{ text: string }> };
    let processedHistory: HistoryMessage[] = (history as HistoryMessage[]) || [];
    
    // 确保历史记录以 'user' 角色开始 (Gemini要求)
    // 移除开头的所有 'model' 消息
    while (processedHistory.length > 0 && processedHistory[0].role === "model") {
      processedHistory = processedHistory.slice(1);
    }
    
    const geminiHistory = processedHistory.map((msg) => {
      // 如果已经是Gemini格式，直接返回
      if (msg.parts) {
        return msg;
      }
      // 否则转换格式
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text || msg.content || "" }],
      };
    });

    // 4. 呼叫 Gemini
    // 使用 flash 模型（便宜且上下文大）
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: systemInstruction 
    });

    const chat = model.startChat({
      history: geminiHistory as Array<{ role: string; parts: Array<{ text: string }> }>, // 保持上下文记忆
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ reply: response });

  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "AI 思考超时或额度不足", details: errorMessage }, 
      { status: 500 }
    );
  }
}