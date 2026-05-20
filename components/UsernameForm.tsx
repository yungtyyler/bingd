"use client";

import { updateUsername } from "@/actions/user";
import { useState } from "react";

export default function UsernameForm({
  initialUsername,
}: {
  initialUsername: string | null;
}) {
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setStatus(null);

    const result = await updateUsername(formData);

    if (result?.error) {
      setStatus({ type: "error", message: result.error });
    } else if (result?.success) {
      setStatus({ type: "success", message: result.message });
    }

    setIsPending(false);
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="username"
          className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
        >
          Username
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-medium">
            bingd.com/u/
          </span>
          <input
            type="text"
            id="username"
            name="username"
            defaultValue={initialUsername || ""}
            placeholder="yourname"
            className="w-full bg-surface-base border border-surface-border text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block pl-28 p-2.5 outline-none transition-all"
            required
          />
        </div>
      </div>

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

      <button
        type="submit"
        disabled={isPending}
        className="cursor-pointer w-full px-4 py-2 text-sm font-bold text-black bg-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save Username"}
      </button>
    </form>
  );
}
