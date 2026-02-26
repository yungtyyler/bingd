"use client";

import { deleteShow } from "@/actions/shows";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DeleteShowButton = ({
  showId,
  showName,
}: {
  showId: string;
  showName: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${showName} from your library?`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteShow(showId);
        toast.success(`${showName} was removed from your library.`);

        router.refresh();
      } catch (error) {
        toast.error(`Failed to remove show. ${error}`);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={`
        cursor-pointer px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md transition-all
        ${isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100 active:scale-95"}
      `}
    >
      {isPending ? "Deleting..." : "Delete from Library"}
    </button>
  );
};

export default DeleteShowButton;
