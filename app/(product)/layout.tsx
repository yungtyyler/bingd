import ProductHeader from "@/components/ProductHeader";
import { ensureDbUser } from "@/lib/ensure-user";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await ensureDbUser();

  return (
    <div className="min-h-screen flex flex-col">
      <ProductHeader username={user.username} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
