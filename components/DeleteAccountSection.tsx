"use client";

import { deleteAccount } from "@/actions/user";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type Status = {
  type: "error";
  message: string;
} | null;

export default function DeleteAccountSection() {
  const [status, setStatus] = useState<Status>(null);
  const [isPending, setIsPending] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setStatus(null);
    setIsPending(true);

    const result = await deleteAccount(formData);

    if (result?.error) {
      setStatus({ type: "error", message: result.error });
      setIsPending(false);
    }
  };

  return (
    <section className="bg-surface-card border border-red-500/30 p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-white mb-2">Delete Account</h2>
      <p className="text-sm text-gray-400 mb-6">
        Permanently delete your bingd account, watch library, profile,
        follows, notification settings, devices, and alert history.
      </p>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="delete-confirmation"
            className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
          >
            Type DELETE to confirm
          </label>
          <input
            id="delete-confirmation"
            name="confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="w-full bg-surface-base border border-surface-border text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 outline-none transition-all"
            autoComplete="off"
          />
        </div>

        {status && (
          <div className="p-3 rounded-md text-sm font-bold border bg-red-500/10 border-red-500/30 text-red-500">
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || confirmation !== "DELETE"}
          className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {isPending ? "Deleting..." : "Delete My Account"}
        </button>
      </form>
    </section>
  );
}
