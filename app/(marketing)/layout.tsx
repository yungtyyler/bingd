import { ReactNode } from "react";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
