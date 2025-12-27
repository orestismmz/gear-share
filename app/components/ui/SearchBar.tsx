"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;

    if (searchValue.trim()) {
      router.push(`/?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex-1 max-w-md mx-4">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          name="search"
          placeholder="Search listings by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-10 pr-20 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-primary text-white rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
        >
          Search
        </button>
      </form>
    </div>
  );
}
