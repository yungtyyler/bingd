"use client";

import { addShow } from "@/actions/shows";

const AddShowButton = ({
  show,
}: {
  show: { tvmazeId: number; name: string; imageUrl?: string };
}) => {
  function handleClick() {
    addShow(show);
    window.alert(`${show.name} was added to your list.`);
  }

  return <button onClick={handleClick}>Add Show</button>;
};

export default AddShowButton;
