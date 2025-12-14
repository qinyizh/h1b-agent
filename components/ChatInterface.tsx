"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Send, Scale, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "model";
  text: string;
};

const WELCOME_MESSAGE: Message = {
  role: "model",
  text: "您好。我是您的 AI 移民顾问。请告诉我您的背景，或询问关于 NIW (国家利益豁免) 的具体法律问题。",
};

const SUGGESTED_QUESTIONS = [
  "NIW vs EB-1A",
  "排期预测",
  "Dhanasar标准",
  "如何证明国家级重要性？",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { role: "user", text: trimmedInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const history = updatedMessages.slice(0, -1).map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput, history: history }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      const aiMessage: Message = { role: "model", text: data.reply };
      setMessages([...updatedMessages, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "发生错误，请稍后重试";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasUserMessages = messages.some((msg) => msg.role === "user");
  const showSuggestedQuestions = !hasUserMessages && messages.length === 1;

  return (
    // 增加底部高度，避免被底部导航栏遮挡 (如果你有 TabBar)
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      
      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "flex gap-4 max-w-3xl",
                message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm",
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white"
                    : "bg-white border border-stone-100 text-emerald-600"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5 fill-emerald-100" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  "rounded-2xl px-5 py-3.5 max-w-[85%] md:max-w-[80%] shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-stone-100 text-stone-800"
                )}
              >
                <div className={cn(
                  "text-[15px] leading-7 break-words",
                  message.role === "model" && "font-sans tracking-wide"
                )}>
                  {message.role === "model" ? (
                    <ReactMarkdown
                      components={{
                        // 优化段落间距
                        p: ({ children }) => <p className="mb-3 last:mb-0 text-stone-700">{children}</p>,
                        
                        // 优化列表样式
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 marker:text-emerald-300/80">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 marker:text-emerald-300/80">{children}</ol>,
                        li: ({ children }) => <li className="pl-0.5">{children}</li>,
                        
                        // 标题加粗
                        strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
                        
                        // 标题
                        h3: ({ children }) => <h3 className="font-bold text-base mt-5 mb-2 text-stone-900">{children}</h3>,

                        // 引用块 (Disclaimer)
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-[3px] border-stone-200 pl-3 py-1 my-3 text-stone-500 text-sm italic bg-stone-50/50 rounded-r">
                            {children}
                          </blockquote>
                        ),

                        // ✨ 终极优化版胶囊链接 ✨
                        a: ({ href, children }) => {
                          const isSourceLink = String(children).includes("Source") || href?.includes("uscis.gov");
                          
                          if (isSourceLink) {
                            return (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 mx-1 -mb-[1px] px-2 py-0.5 bg-emerald-50 text-emerald-700/90 text-[10px] font-medium border border-emerald-100/80 rounded-full no-underline hover:bg-emerald-100 hover:text-emerald-800 hover:border-emerald-300 transition-all align-middle select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                              >
                                <ExternalLink size={9} className="stroke-[2.5] opacity-60" />
                                <span className="tracking-tight">{children}</span>
                              </a>
                            );
                          }
                          return (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline decoration-blue-200 underline-offset-2 font-medium"
                            >
                              {children}
                            </a>
                          );
                        }
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Bubble */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-3xl mr-auto pl-1"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-stone-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Sparkles className="w-5 h-5 fill-emerald-100 animate-pulse" />
            </div>
            <div className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto px-4">
             <div className="bg-red-50/80 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 shadow-sm">
               {error}
             </div>
          </div>
        )}

        {/* Suggested Questions */}
        {showSuggestedQuestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto pt-2"
          >
            <p className="text-xs text-stone-400 font-medium mb-3 pl-1">推荐问题</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-4 py-2 text-sm bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all shadow-sm active:scale-95"
                >
                  {question}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-t from-white via-white to-white/90 backdrop-blur-lg border-t border-stone-100">
        <div className="container mx-auto max-w-4xl px-4 pt-3 pb-6"> {/* ✨ 这里增加了 pb-6 */}
          <div className="relative flex items-end gap-3 bg-white border border-stone-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="问点什么..." // 简化文案
              disabled={isLoading}
              rows={1}
              className="w-full pl-5 pr-14 py-3.5 bg-transparent focus:outline-none font-sans text-base text-stone-800 placeholder:text-stone-400 resize-none disabled:opacity-50"
              style={{ maxHeight: "120px", minHeight: "52px" }}
            />
            {/* ✨ 发送按钮优化: 全圆角 + 动效 */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-2 bottom-2 p-2 rounded-full transition-all duration-200 flex items-center justify-center", // rounded-full
                input.trim() && !isLoading
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 active:scale-95"
                  : "bg-stone-100 text-stone-300 cursor-not-allowed" // 禁用状态更柔和
              )}
            >
              <Send className={cn("w-5 h-5", input.trim() ? "ml-0.5" : "")} /> {/* 微调 icon 位置 */}
            </button>
          </div>
          
          <p className="text-[10px] text-stone-400 text-center mt-3">
            AI 生成内容仅供参考，不构成法律建议。
          </p>
        </div>
      </div>
    </div>
  );
}