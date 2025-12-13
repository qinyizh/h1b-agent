"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Region = "china" | "global";

type DateStatus = {
  date: string | "C"; // "C" means Current
  movement?: string; // e.g., "前进 30天", "停滞"
  movementType?: "forward" | "stalled";
};

type CategoryData = {
  finalActionDate: DateStatus; // 表A
  dateForFiling: DateStatus; // 表B
};

type BulletinData = {
  month: string;
  china: {
    "EB-1": CategoryData;
    "EB-2": CategoryData;
    "EB-3": CategoryData;
  };
  global: {
    "EB-1": CategoryData;
    "EB-2": CategoryData;
    "EB-3": CategoryData;
  };
};

const BULLETIN_DATA: BulletinData = {
  month: "2025年1月",
  china: {
    "EB-1": {
      finalActionDate: { date: "C" },
      dateForFiling: { date: "C" },
    },
    "EB-2": {
      finalActionDate: {
        date: "2020-03-01",
        movement: "前进 30天",
        movementType: "forward",
      },
      dateForFiling: { date: "2020-07-01" },
    },
    "EB-3": {
      finalActionDate: {
        date: "2019-12-01",
        movement: "停滞",
        movementType: "stalled",
      },
      dateForFiling: { date: "2020-03-01" },
    },
  },
  global: {
    "EB-1": {
      finalActionDate: { date: "C" },
      dateForFiling: { date: "C" },
    },
    "EB-2": {
      finalActionDate: { date: "C" },
      dateForFiling: { date: "C" },
    },
    "EB-3": {
      finalActionDate: {
        date: "2024-06-01",
        movement: "前进 60天",
        movementType: "forward",
      },
      dateForFiling: { date: "2024-09-01" },
    },
  },
};

const categoryLabels: Record<string, string> = {
  "EB-1": "EB-1 (杰出人才)",
  "EB-2": "EB-2 (高等学位)",
  "EB-3": "EB-3 (专业技能)",
};

const categoryOrder: Array<keyof BulletinData["china"]> = ["EB-1", "EB-2", "EB-3"];

function formatDate(dateString: string | "C"): string {
  if (dateString === "C") return "无排期";
  
  // Convert YYYY-MM-DD to DDMMMYY format (e.g., 2020-03-01 -> 01MAR20)
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}${month}${year}`;
}

function DateDisplay({ status }: { status: DateStatus }) {
  if (status.date === "C") {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold font-sans">
        无排期
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-base text-foreground">
        {formatDate(status.date)}
      </span>
      {status.movement && (
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium font-sans",
            status.movementType === "forward"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {status.movement}
        </span>
      )}
    </div>
  );
}

export function VisaBulletin() {
  const [selectedRegion, setSelectedRegion] = useState<Region>("china");

  const regionData =
    selectedRegion === "china" ? BULLETIN_DATA.china : BULLETIN_DATA.global;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            US Visa Bulletin
          </h1>
          <p className="text-lg text-muted font-sans">
            {BULLETIN_DATA.month}
          </p>
        </div>

        {/* Region Filter - Segmented Control */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg border-2 border-stone-200 bg-white p-1">
            <button
              onClick={() => setSelectedRegion("china")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium font-sans transition-colors",
                selectedRegion === "china"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground hover:bg-stone-50"
              )}
            >
              中国大陆
            </button>
            <button
              onClick={() => setSelectedRegion("global")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium font-sans transition-colors",
                selectedRegion === "global"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground hover:bg-stone-50"
              )}
            >
              全球 (ROW)
            </button>
          </div>
        </div>

        {/* Category Cards */}
        <div className="space-y-4">
          {categoryOrder.map((category, index) => {
            const data = regionData[category];
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white border border-stone-200 rounded-lg p-5 md:p-6 shadow-sm"
              >
                {/* Card Header */}
                <h2 className="text-xl font-serif font-semibold text-foreground mb-5">
                  {categoryLabels[category]}
                </h2>

                {/* Table A - Final Action Date */}
                <div className="mb-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-muted font-sans">
                      表 A (批准日):
                    </span>
                    <DateDisplay status={data.finalActionDate} />
                  </div>
                </div>

                {/* Table B - Date for Filing */}
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-muted font-sans">
                      表 B (递交日):
                    </span>
                    <DateDisplay status={data.dateForFiling} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-stone-50 border border-stone-200 rounded-lg">
          <p className="text-xs text-muted font-sans leading-relaxed">
            <strong>说明：</strong>表 A (Final Action Date) 为移民局最终批准绿卡的截止日期。
            表 B (Date for Filing) 为可以递交 I-485 申请的日期。数据仅供参考，请以官方公告为准。
          </p>
        </div>
      </div>
    </div>
  );
}

