import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
