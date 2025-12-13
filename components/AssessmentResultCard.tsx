"use client";

import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

type AssessmentResultCardProps = {
  status: "high-potential" | "review-needed";
};

export function AssessmentResultCard({ status }: AssessmentResultCardProps) {
  const isHighPotential = status === "high-potential";
  const badgeText = isHighPotential ? "潜力较高" : "需进一步评估";
  const badgeColor = isHighPotential
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-yellow-50 text-yellow-700 border-yellow-200";

  // Get today's date in Chinese format
  const today = new Date();
  const dateString = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  // Hardcoded demo content
  const strengths = [
    "您的学术引用量 (150+) 显著高于领域平均水平。",
    "博士学位符合 EB-2 NIW 的高级学位要求。",
    "您提出的赴美计划具有明确的国家级重要性。",
  ];

  const risks = [
    "缺乏审稿经验，建议加强 'Dhanasar Prongs 2' 的证据链。",
    "建议补充更多同行认可的证据（如推荐信、媒体报道等）。",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-stone-200 shadow-sm rounded-lg p-6 md:p-8 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="relative mb-6 pb-6 border-b border-stone-200">
        {/* Badge - Top Right */}
        <div className="absolute top-0 right-0">
          <span
            className={`px-4 py-1.5 rounded-md text-sm font-semibold border ${badgeColor} font-sans`}
          >
            {badgeText}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-serif font-bold text-foreground pr-28 md:pr-32 mb-2">
          NIW 移民资格初步评估意见
        </h2>

        {/* Date */}
        <p className="text-sm text-muted font-sans">{dateString}</p>
      </div>

      {/* Body Content */}
      <div className="space-y-8 mb-8">
        {/* Section 1: Strengths */}
        <div>
          <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
            核心优势
          </h3>
          <div className="space-y-3">
            {strengths.map((strength, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-md bg-green-50/50"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 font-sans leading-relaxed">
                  {strength}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Risks */}
        <div>
          <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
            潜在风险
          </h3>
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-md bg-amber-50/50"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 font-sans leading-relaxed">
                  {risk}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Call to Action */}
      <div className="pt-6 border-t border-stone-200 space-y-3">
        <button
          disabled
          className="w-full px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
        >
          解锁完整分析报告 (演示)
        </button>
        <Link
          href="/"
          className="block w-full text-center px-6 py-3 text-primary border-2 border-primary rounded-md font-medium hover:bg-primary/5 transition-colors font-sans"
        >
          咨询 AI 顾问
        </Link>
      </div>
    </motion.div>
  );
}

