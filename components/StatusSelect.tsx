"use client";

import { updateShowStatus } from "@/actions/shows";
import { WatchStatus } from "@/app/generated/prisma/enums";
import { useState } from "react";

interface StatusSelectProps {
  initialStatus: WatchStatus;
  showId: string;
}

const StatusSelect = ({ initialStatus, showId }: StatusSelectProps) => {
  const [status, setStatus] = useState<WatchStatus>(initialStatus);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as WatchStatus;

    setStatus(newStatus);
    updateShowStatus(showId, newStatus);
  };

  return (
    <div className="text-xs uppercase tracking-wider font-bold text-gray-500">
      <select
        value={status}
        onChange={handleChange}
        className="bg-transparent border-none focus:ring-0 cursor-pointer"
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
