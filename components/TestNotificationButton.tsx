"use client";

import { Send } from "lucide-react";
import { useState } from "react";

type Status = {
  type: "success" | "error";
  message: string;
} | null;

export default function TestNotificationButton() {
  const [status, setStatus] = useState<Status>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSendTest = async () => {
    setStatus(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/test-notification", {
        method: "POST",
      });
      const result = (await response.json()) as {
        success?: boolean;
        sent?: number;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not send a test alert.");
      }

      setStatus({
        type: "success",
        message: `Sent to ${result.sent || 1} active device${
          result.sent === 1 ? "" : "s"
        }.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not send a test alert.",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSendTest}
        disabled={isPending}
        className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-surface-border bg-surface-base px-4 py-2 text-sm font-bold text-white transition-colors hover:border-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4 text-brand-primary" aria-hidden="true" />
        {isPending ? "Sending..." : "Send Test Alert"}
      </button>

      {status && (
        <div
          className={`p-3 rounded-md text-sm font-bold border ${
            status.type === "success"
              ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
              : "bg-red-500/10 border-red-500/30 text-red-500"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
