"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ScrollText,
  Target,
  Calendar,
  AlertTriangle,
  Zap,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryType = "流程" | "核心" | "排期" | "风险" | "捷径";

type GlossaryTerm = {
  term: string;
  category: CategoryType;
  definition: string;
};

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "PERM (劳工证)",
    category: "流程",
    definition:
      "绿卡的第一关。美国劳工部(DOL)为了保护本地人就业，要求你的雇主证明&ldquo;招不到美国人&rdquo;才能雇佣你。通常耗时 6-12 个月，不仅慢，还可能因为裁员潮被暂停 (Audit)。",
  },
  {
    term: "I-140 (移民资格申请)",
    category: "核心",
    definition:
      "向移民局(USCIS)提交的&ldquo;资格考试&rdquo;。批准了才代表移民局承认你有资格拿绿卡。NIW 和 EB-1A 的核心就是攻克这一步。I-140 批准后，你的&ldquo;优先日(PD)&rdquo;就被锁定了。",
  },
  {
    term: "Priority Date (优先日/PD)",
    category: "排期",
    definition:
      "你的&ldquo;排队号码牌&rdquo;。对于需要走 PERM 的人，PD 是劳工局收到申请的那天；对于 NIW/EB-1，PD 是移民局收到 I-140 的那天。排期表就是看你的 PD 有没有轮到。",
  },
  {
    term: "Current (无排期)",
    category: "排期",
    definition:
      "每一个中国申请人的梦想。意味着你可以同时递交 I-140 和 I-485，或者立刻递交 I-485，不需要等待。目前 EB-1 偶尔会出现 Current，其他类别通常需要排队。",
  },
  {
    term: "RFE (补件通知)",
    category: "风险",
    definition:
      "Request for Evidence。移民局觉得你的材料不够，但不想直接拒你，所以给你一次机会补充材料。收到 RFE 不代表失败，只要在规定时间内（通常 87 天）完美回击，依然可以获批。",
  },
  {
    term: "NIW (国家利益豁免)",
    category: "捷径",
    definition:
      "EB-2 的特种部队。它豁免了&ldquo;雇主支持&rdquo;和&ldquo;PERM劳工证&rdquo;。只要你证明自己比普通同行优秀，且工作对美国有&ldquo;国家级重要性&rdquo;，就可以直接向移民局申请绿卡。是博士和高阶工程师的各类首选。",
  },
];

const categoryIcons: Record<CategoryType, typeof ScrollText> = {
  流程: ScrollText,
  核心: Target,
  排期: Calendar,
  风险: AlertTriangle,
  捷径: Zap,
};

const categoryColors: Record<CategoryType, string> = {
  流程: "text-gray-700 bg-gray-100",
  核心: "text-gray-700 bg-gray-100",
  排期: "text-gray-700 bg-gray-100",
  风险: "text-red-700 bg-red-100",
  捷径: "text-yellow-700 bg-yellow-100",
};

export function GlossarySection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [aiDefinition, setAiDefinition] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced API call for AI definition
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset AI definition if search is empty
    if (!searchQuery.trim()) {
      setAiDefinition(null);
      setIsAiLoading(false);
      return;
    }

    // Set loading state immediately
    setIsAiLoading(true);

    // Set debounce timer (600ms)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/wiki/quick-def", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: searchQuery.trim() }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch definition");
        }

        const data = await response.json();
        setAiDefinition(data.definition || null);
      } catch (error) {
        console.error("Error fetching AI definition:", error);
        setAiDefinition(null);
      } finally {
        setIsAiLoading(false);
      }
    }, 600);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) {
      return GLOSSARY_TERMS;
    }

    const query = searchQuery.toLowerCase().trim();
    return GLOSSARY_TERMS.filter(
      (term) =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        term.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Immigration Glossary
          </h1>
          <p className="text-lg text-muted font-sans">
            常用术语与概念解释
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terminology..."
              className="w-full pl-12 pr-4 py-4 text-base border-2 border-stone-200 rounded-lg bg-white focus:outline-none focus:border-primary font-sans placeholder:text-muted"
            />
          </div>
        </div>

        {/* AI Knowledge Card */}
        {searchQuery.trim() && (
          <div className="mb-6">
            {isAiLoading ? (
              // Loading Skeleton
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-yellow-50/50 border border-[#D4AF37]/30 rounded-lg p-5 md:p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-5 bg-stone-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-stone-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-stone-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-stone-200 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-stone-200 rounded animate-pulse w-4/6" />
                </div>
              </motion.div>
            ) : aiDefinition ? (
              // AI Definition Card
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-yellow-50/50 border border-[#D4AF37]/30 rounded-lg p-5 md:p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-lg font-serif font-semibold text-foreground">
                    AI 速查 (Quick Look)
                  </h3>
                </div>
                <p className="text-sm md:text-base text-foreground/80 font-sans leading-relaxed">
                  {aiDefinition}
                </p>
              </motion.div>
            ) : null}
          </div>
        )}

        {/* Glossary Grid */}
        {filteredTerms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTerms.map((term, index) => {
                const Icon = categoryIcons[term.category];
                const colorClass = categoryColors[term.category];

                return (
                  <motion.div
                    key={term.term}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="bg-white border border-stone-200 rounded-lg p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-sans",
                          colorClass
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {term.category}
                      </span>
                    </div>

                    {/* Term Title */}
                    <h2 className="text-lg md:text-xl font-serif font-bold text-foreground mb-3">
                      {term.term}
                    </h2>

                    {/* Definition */}
                    <p className="text-sm md:text-base text-foreground/80 font-sans leading-relaxed">
                      {term.definition}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted font-sans">
              No results found
            </p>
            <p className="text-sm text-muted/70 font-sans mt-2">
              Try a different search term
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

