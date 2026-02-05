import ProductHeader from "@/components/ProductHeader";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ProductHeader />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
