"use client";

import { addShow } from "@/actions/shows";
import { ShowSnippet } from "@/types";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const AddShowButton = ({ show }: { show: ShowSnippet }) => {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(!!show.status);

  const handleClick = () => {
    if (isSuccess) return;

    startTransition(async () => {
      try {
        await addShow(show);
        setIsSuccess(true);
        toast.success(`${show.name} added to your library!`);
      } catch (error) {
        toast.error("Failed to add show. Please try again. " + error);
      }
    });
  };

  if (isSuccess) {
    return (
      <button
        disabled
        className="w-full px-4 py-2 text-sm font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 rounded-md cursor-default"
      >
        {show.status ? "✓ In Library" : "✓ Saved"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        w-full px-4 py-2 text-sm font-bold transition-all rounded-md
        ${
          isPending
            ? "bg-surface-border text-gray-400 cursor-not-allowed"
            : "bg-brand-primary text-black cursor-pointer hover:bg-brand-primary-hover active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
        }
      `}
    >
      {isPending ? "Adding..." : "+ Add to Library"}
    </button>
  );
};

export default AddShowButton;
