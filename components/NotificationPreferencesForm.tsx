"use client";

import { updateNotificationPreferences } from "@/actions/notifications";
import { Bell, CalendarClock, CalendarDays, Sparkles } from "lucide-react";
import { useState } from "react";
import WebPushSubscriptionButton from "./WebPushSubscriptionButton";

type NotificationPreferenceValues = {
  pushEnabled: boolean;
  airingTonightEnabled: boolean;
  airingThisWeekEnabled: boolean;
  newSeasonThisWeekEnabled: boolean;
  timezone: string | null;
};

type Status = {
  type: "success" | "error";
  message: string;
} | null;

const notificationOptions = [
  {
    name: "pushEnabled",
    label: "Push notifications",
    Icon: Bell,
  },
  {
    name: "airingTonightEnabled",
    label: "Airing tonight",
    Icon: CalendarClock,
  },
  {
    name: "airingThisWeekEnabled",
    label: "Airing this week",
    Icon: CalendarDays,
  },
  {
    name: "newSeasonThisWeekEnabled",
    label: "New seasons",
    Icon: Sparkles,
  },
] as const;

export default function NotificationPreferencesForm({
  preferences,
}: {
  preferences: NotificationPreferenceValues;
}) {
  const [status, setStatus] = useState<Status>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setStatus(null);

    if (!formData.get("timezone")) {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detectedTimezone) {
        formData.set("timezone", detectedTimezone);
      }
    }

    const result = await updateNotificationPreferences(formData);

    if (result?.error) {
      setStatus({ type: "error", message: result.error });
    } else if (result?.success) {
      setStatus({ type: "success", message: result.message });
    }

    setIsPending(false);
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <input
        type="hidden"
        name="timezone"
        defaultValue={preferences.timezone || ""}
      />

      <div className="space-y-3">
        {notificationOptions.map(({ name, label, Icon }) => (
          <label
            key={name}
            className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-lg border border-surface-border bg-surface-base px-3 py-2"
          >
            <span className="flex items-center gap-3 text-sm font-bold text-white">
              <Icon className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              {label}
            </span>
            <input
              type="checkbox"
              name={name}
              defaultChecked={preferences[name]}
              className="h-5 w-5 accent-brand-primary"
            />
          </label>
        ))}
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
        {isPending ? "Saving..." : "Save Notifications"}
      </button>

      <WebPushSubscriptionButton />
    </form>
  );
}
