import Link from "next/link";
import { WatchStatus } from "@/app/generated/prisma/enums";

const LibraryTabs = ({ currentFilter }: { currentFilter?: string }) => {
  const tabs = [
    { label: "All Shows", value: undefined },
    { label: "Watching", value: WatchStatus.WATCHING },
    { label: "Planned", value: WatchStatus.PLANNED },
    { label: "Completed", value: WatchStatus.COMPLETED },
    { label: "Dropped", value: WatchStatus.DROPPED },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.value;
        const href = tab.value ? `/library?status=${tab.value}` : "/library";

        return (
          <Link
            key={tab.label}
            href={href}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-black text-white border border-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};

export default LibraryTabs;
