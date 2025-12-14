import { Search } from "lucide-react";

export default function ContentSearchBar({ className = "" }) {
  return (
    <div className={`relative w-full flex justify-center ${className}`}>
      <div className="relative w-full max-w-xl">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          className="w-full rounded-full pl-12 pr-4 py-2 bg-card text-sm focus:ring-2 focus:ring-primary/40 outline-none"
          placeholder="Search..."
        />
      </div>
    </div>
  );
}
