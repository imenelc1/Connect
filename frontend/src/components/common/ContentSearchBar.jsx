import React from "react";

export default function ContentSearchBar({ placeholder = "Search..." }) {
  return (
    <div className="flex justify-center items-center gap-4 my-6">
      <input
        className="w-1/2 rounded-full px-4 py-2 shadow border border-primary/40 bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/40"
        placeholder={placeholder}
      />
      <select className="rounded-xl px-4 py-2 shadow bg-white border border-primary/30">
        <option>My items</option>
        <option>All items</option>
      </select>
    </div>
  );
}
