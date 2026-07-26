import { NotificationStatus, NotificationType } from "@/app/generated/prisma/enums";
import { AlertCircle, Bell, CheckCircle2, Clock3 } from "lucide-react";

type NotificationHistoryEntry = {
  id: string;
  createdAt: Date;
  sentAt: Date | null;
  failedAt: Date | null;
  scheduledFor: Date | null;
  failureReason: string | null;
  status: NotificationStatus;
  type: NotificationType;
  show: {
    name: string;
  } | null;
};

const typeLabels: Record<NotificationType, string> = {
  AIRING_TONIGHT: "Airing tonight",
  AIRING_THIS_WEEK: "Airing this week",
  NEW_SEASON_THIS_WEEK: "New season",
};

const statusStyles: Record<NotificationStatus, string> = {
  PENDING: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  SENT: "border-brand-primary/30 bg-brand-primary/10 text-brand-primary",
  FAILED: "border-red-500/30 bg-red-500/10 text-red-400",
  SKIPPED: "border-gray-600 bg-white/5 text-gray-400",
};

const statusIcons = {
  PENDING: Clock3,
  SENT: CheckCircle2,
  FAILED: AlertCircle,
  SKIPPED: Bell,
};

function formatDate(date: Date | null) {
  if (!date) return "Not recorded";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function NotificationHistory({
  logs,
}: {
  logs: NotificationHistoryEntry[];
}) {
  return (
    <section className="bg-surface-card border border-surface-border p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-bold text-white mb-2">Recent Alerts</h2>
      <p className="text-sm text-gray-400 mb-6">
        A short record of notification attempts for your account.
      </p>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-surface-border bg-surface-base p-4 text-sm text-gray-500">
          No alerts have been scheduled yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const StatusIcon = statusIcons[log.status];
            const timestamp = log.sentAt || log.failedAt || log.scheduledFor;

            return (
              <div
                key={log.id}
                className="rounded-lg border border-surface-border bg-surface-base p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {log.show?.name || "Unknown show"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {typeLabels[log.type]} · {formatDate(timestamp)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[log.status]}`}
                  >
                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                    {log.status.toLowerCase()}
                  </span>
                </div>

                {log.failureReason && (
                  <p className="mt-3 text-xs text-red-400">
                    {log.failureReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
