"use client";

import { addShow } from "@/actions/shows";
import { ShowSnippet } from "@/types";
import { useState, useTransition } from "react";

const AddShowButton = ({ show }: { show: ShowSnippet }) => {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(!!show.status);

  const handleClick = () => {
    if (isSuccess) return;

    startTransition(async () => {
      try {
        await addShow(show);
        setIsSuccess(true);
      } catch (error) {
        console.error("Failed to add show: ", error);
      }
    });
  };

  if (isSuccess) {
    return (
      <button
        disabled
        className="w-full px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md cursor-default"
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
        w-full px-4 py-2 text-sm font-medium text-white transition-all rounded-md
        ${
          isPending
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer"
        }
      `}
    >
      {isPending ? "Adding..." : "+ Add to Library"}
    </button>
  );
};

export default AddShowButton;
