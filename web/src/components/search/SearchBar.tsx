"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar({
  initialQuery,
  large,
}: {
  initialQuery?: string;
  large?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery || "");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${large ? "w-6 h-6" : "w-5 h-5"}`}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search artists, merch, news..."
        className={`w-full bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${
          large ? "pl-14 pr-12 py-4 text-lg" : "pl-11 pr-10 py-3 text-sm"
        }`}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className={large ? "w-6 h-6" : "w-5 h-5"} />
        </button>
      )}
    </form>
  );
}
