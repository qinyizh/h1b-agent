"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AssessmentResultCard } from "@/components/AssessmentResultCard";

type FormData = {
  education: "PhD" | "Master's" | "Bachelor's" | "Other" | "";
  hasExperience: boolean;
  citations: number | "";
  reviewExperience: number | "";
  awardsPatents: string;
  endeavor: string;
};

const TOTAL_STEPS = 6;

const educationOptions = [
  { value: "PhD" as const, label: "博士 (PhD)" },
  { value: "Master's" as const, label: "硕士 (Master's)" },
  { value: "Bachelor's" as const, label: "本科 (Bachelor's)" },
  { value: "Other" as const, label: "其他" },
];

const loadingMessages = [
  "正在读取 USCIS Policy Manual...",
  "正在比对 AAO 判例库...",
  "正在基于 Dhanasar 三要素建立模型...",
];

export function AssessmentWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const {
    register,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      education: "",
      hasExperience: false,
      citations: "",
      reviewExperience: "",
      awardsPatents: "",
      endeavor: "",
    },
  });

  const education = watch("education");
  const hasExperience = watch("hasExperience");

  // Handle loading message rotation
  useEffect(() => {
    if (currentStep === 4 && isAnalyzing) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, isAnalyzing]);

  // Handle step navigation
  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      const isValid = await trigger("education");
      if (isValid) {
        if (education === "Bachelor's") {
          const experienceValid = await trigger("hasExperience");
          if (experienceValid) {
            setCurrentStep(2);
          }
        } else {
          setCurrentStep(2);
        }
      }
      return;
    }

    if (currentStep === 2) {
      const isValid = await trigger(["citations", "reviewExperience"]);
      if (isValid) {
        setCurrentStep(3);
      }
      return;
    }

    if (currentStep === 3) {
      const isValid = await trigger("endeavor");
      if (isValid) {
        setCurrentStep(4);
        setIsAnalyzing(true);
        setLoadingMessageIndex(0);
        // Wait 3 seconds then show result
        setTimeout(() => {
          setIsAnalyzing(false);
          setCurrentStep(5);
        }, 3000);
      }
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-secondary z-50">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Step 0: Intro */}
          {currentStep === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                NIW 移民资格智能初筛
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 font-sans max-w-md">
                基于《Matter of Dhanasar》判例标准的 AI 预评估
              </p>
              <button
                onClick={handleNext}
                className="mt-8 px-8 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors font-sans"
              >
                开始评估
              </button>
            </motion.div>
          )}

          {/* Step 1: Education */}
          {currentStep === 1 && (
            <motion.div
              key="education"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                您的最高学历是？
              </h2>

              <div className="space-y-4">
                {educationOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center p-4 border-2 rounded-md cursor-pointer transition-colors",
                      education === option.value
                        ? "border-primary bg-primary/5"
                        : "border-secondary hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register("education", {
                        required: "请选择您的最高学历",
                      })}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center",
                        education === option.value
                          ? "border-primary"
                          : "border-secondary"
                      )}
                    >
                      {education === option.value && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="font-sans text-foreground">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>

              {errors.education && (
                <p className="text-sm text-red-600 font-sans">
                  {errors.education.message}
                </p>
              )}

              {/* Conditional: Experience checkbox for Bachelor's */}
              {education === "Bachelor's" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4"
                >
                  <label className="flex items-start p-4 border-2 border-secondary rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="checkbox"
                      {...register("hasExperience", {
                        required:
                          education === "Bachelor's"
                            ? "此字段为必填项"
                            : false,
                      })}
                      className="mt-1 w-5 h-5 rounded border-secondary text-primary focus:ring-primary"
                    />
                    <span className="ml-3 font-sans text-foreground">
                      是否拥有 5 年以上全职、渐进式的工作经验？
                    </span>
                  </label>
                  {errors.hasExperience && (
                    <p className="mt-2 text-sm text-red-600 font-sans">
                      {errors.hasExperience.message}
                    </p>
                  )}
                </motion.div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border-2 border-secondary text-foreground rounded-md font-medium hover:bg-secondary/50 transition-colors font-sans"
                >
                  返回
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    !education ||
                    (education === "Bachelor's" && !hasExperience)
                  }
                  className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto font-sans"
                >
                  下一步
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Impact */}
          {currentStep === 2 && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                量化您的专业影响力
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2 font-sans">
                    Google Scholar 引用量
                  </label>
                  <input
                    type="number"
                    {...register("citations", {
                      required: "请输入您的引用量",
                      min: { value: 0, message: "必须大于或等于 0" },
                    })}
                    className="w-full px-4 py-3 border-2 border-secondary rounded-md focus:outline-none focus:border-primary font-sans text-base"
                    placeholder="例如：10, 50, 100..."
                  />
                  {errors.citations && (
                    <p className="mt-1 text-sm text-red-600 font-sans">
                      {errors.citations.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2 font-sans">
                    审稿/评审经验 (次)
                  </label>
                  <input
                    type="number"
                    {...register("reviewExperience", {
                      required: "请输入您的审稿/评审经验次数",
                      min: { value: 0, message: "必须大于或等于 0" },
                    })}
                    className="w-full px-4 py-3 border-2 border-secondary rounded-md focus:outline-none focus:border-primary font-sans text-base"
                    placeholder="Peer Review 次数"
                  />
                  {errors.reviewExperience && (
                    <p className="mt-1 text-sm text-red-600 font-sans">
                      {errors.reviewExperience.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2 font-sans">
                    关键成就/奖项 <span className="text-foreground/50">(选填)</span>
                  </label>
                  <textarea
                    {...register("awardsPatents")}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-secondary rounded-md focus:outline-none focus:border-primary font-sans text-base resize-none"
                    placeholder="例如：发明专利、媒体报道、行业协会会员..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border-2 border-secondary text-foreground rounded-md font-medium hover:bg-secondary/50 transition-colors font-sans"
                >
                  返回
                </button>
                <button
                  onClick={handleNext}
                  disabled={!watch("citations") || !watch("reviewExperience")}
                  className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto font-sans"
                >
                  下一步
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Endeavor */}
          {currentStep === 3 && (
            <motion.div
              key="endeavor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                您未来的赴美计划 (Proposed Endeavor)
              </h2>

              <p className="text-sm text-foreground/60 font-sans">
                NIW 要求申请人证明其工作具有&ldquo;国家级重要性&rdquo;。请简述您打算在美国从事什么具体工作或研究。
              </p>

              <div>
                <textarea
                  {...register("endeavor", {
                    required: "请描述您的赴美计划",
                    minLength: {
                      value: 20,
                      message: "请至少输入 20 个字符",
                    },
                  })}
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-secondary rounded-md focus:outline-none focus:border-primary font-sans text-base resize-none"
                  placeholder="例如：我计划研发基于 AI 的医疗诊断算法，以改善美国偏远地区的医疗资源分配..."
                />
                {errors.endeavor && (
                  <p className="mt-1 text-sm text-red-600 font-sans">
                    {errors.endeavor.message}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border-2 border-secondary text-foreground rounded-md font-medium hover:bg-secondary/50 transition-colors font-sans"
                >
                  返回
                </button>
                <button
                  onClick={handleNext}
                  disabled={!watch("endeavor") || watch("endeavor").length < 20}
                  className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto font-sans"
                >
                  开始分析
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Analyzing */}
          {currentStep === 4 && isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              />
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMessageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg md:text-xl text-foreground/80 font-sans"
                >
                  {loadingMessages[loadingMessageIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Step 5: Result */}
          {currentStep === 5 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <AssessmentResultCard status="high-potential" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
