"use client";

import { updateShowStatus } from "@/actions/shows";
import { WatchStatus } from "@/app/generated/prisma/enums";
import { useState } from "react";
import { toast } from "sonner";

interface StatusSelectProps {
  initialStatus: WatchStatus;
  showId: string;
}

const StatusSelect = ({ initialStatus, showId }: StatusSelectProps) => {
  const [status, setStatus] = useState<WatchStatus>(initialStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as WatchStatus;
    setStatus(newStatus);

    try {
      await updateShowStatus(showId, newStatus);

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      setStatus(initialStatus);
      toast.error(`Failed to update status. ${error}`);
    }
  };

  return (
    <div className="text-xs uppercase tracking-wider font-bold text-gray-500">
      <select
        value={status}
        onChange={handleChange}
        className="bg-transparent border-none focus:ring-0 cursor-pointer p-0"
      >
        {Object.values(WatchStatus).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusSelect;
