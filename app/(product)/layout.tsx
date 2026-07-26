import ProductHeader from "@/components/ProductHeader";
import { ensureDbUser } from "@/lib/ensure-user";
import { isPendingUsername } from "@/lib/usernames";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await ensureDbUser();

  if (isPendingUsername(user.username)) {
    redirect("/onboarding/username");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <ProductHeader username={user.username} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-28 sm:px-6 sm:py-8 md:pb-8">
        {children}
      </main>
    </div>
  );
}
