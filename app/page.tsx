import { MainLayout } from "@/components/MainLayout";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 md:py-20">
        <div className="max-w-3xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground">
            Your AI Immigration Copilot
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto font-sans">
            Professional NIW assessment and planning.
          </p>
          <div className="pt-6">
            <Link
              href="/assess"
              className="inline-block px-8 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Start Assessment
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
