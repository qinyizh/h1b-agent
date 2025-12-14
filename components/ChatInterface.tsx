"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Send, Scale, ExternalLink } from "lucide-react"; // 1. 引入 ExternalLink 图标
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

  // Auto-scroll to bottom when messages change
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
      // Send conversation history (excluding the current user message which is already in updatedMessages)
      const history = updatedMessages.slice(0, -1).map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          history: history,
        }),
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
      console.error("Chat error:", err);
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
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)]">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex gap-3 max-w-3xl",
                message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-stone-200 text-stone-700"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Scale className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={cn(
                  "rounded-2xl px-5 py-4 max-w-[90%] md:max-w-[80%] shadow-sm", // 增加 padding 和投影，质感更好
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-stone-100 text-stone-800" // 边框颜色淡一点，更干净
                )}
              >
                <div className={cn(
                  "text-sm md:text-base leading-7 break-words", // leading-7 增加行高，阅读更舒适
                  message.role === "model" && "font-sans" // ✨ 关键修改：改回 font-sans (无衬线体)
                )}>
                  {message.role === "model" ? (
                    <ReactMarkdown
                      components={{
                        // 1. 段落：增加下边距，颜色稍微深一点
                        p: ({ children }) => <p className="mb-4 last:mb-0 text-stone-700">{children}</p>,
                        
                        // 2. 列表：调整缩进和间距，Marker 颜色淡化
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-stone-400">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-stone-400">{children}</ol>,
                        
                        // 3. 列表项：确保对齐
                        li: ({ children }) => <li className="pl-1">{children}</li>,
                        
                        // 4. 标题/加粗：加深颜色，更醒目
                        strong: ({ children }) => <strong className="font-bold text-stone-900">{children}</strong>,
                        
                        // 5. 标题 (如果 AI 输出了 # 标题)
                        h3: ({ children }) => <h3 className="font-bold text-lg mt-6 mb-2 text-stone-900">{children}</h3>,
                        
                        // 6. 引用块 (用于 Disclaimer)
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-stone-300 pl-4 py-1 my-4 text-stone-500 italic bg-stone-50 rounded-r">
                            {children}
                          </blockquote>
                        ),

                        // 7. ✨ 精修版胶囊按钮 ✨
                        // 稍微调小一点，颜色更清透，垂直对齐更好
                        a: ({ href, children }) => {
                          const isSourceLink = String(children).includes("Source") || href?.includes("uscis.gov");
                          
                          if (isSourceLink) {
                            return (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mx-1 -mb-[2px] px-2.5 py-0.5 bg-emerald-50/80 text-emerald-700 text-[11px] font-medium border border-emerald-200/60 rounded-full no-underline hover:bg-emerald-100 hover:border-emerald-300 transition-all align-baseline select-none"
                              >
                                <ExternalLink size={10} className="stroke-[2.5] opacity-70" />
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

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-3xl mr-auto"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700">
              <Scale className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-sans">
              {error}
            </div>
          </motion.div>
        )}

        {/* Suggested Questions */}
        {showSuggestedQuestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto pt-4"
          >
            <p className="text-sm text-muted font-sans mb-3">建议问题：</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="px-4 py-2 text-sm bg-white border border-stone-200 rounded-full text-foreground hover:bg-stone-50 hover:border-primary/50 transition-colors font-sans"
                >
                  {question}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-stone-200 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 pr-12 border-2 border-stone-200 rounded-lg bg-white focus:outline-none focus:border-primary font-sans text-base resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-2 bottom-2 p-2 rounded-lg transition-colors",
                  input.trim() && !isLoading
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted font-sans mt-2 px-1">
            本工具由 AI 驱动，仅提供信息参考，不构成法律建议。具体个案请务必咨询持牌移民律师。
          </p>
        </div>
      </div>
    </div>
  );
}