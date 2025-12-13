import { Navigation } from "./Navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
    </div>
  );
}
