import { Suspense } from "react";
import Logo from "@/app/components/ui/Logo";
import Nav from "@/app/components/ui/Nav";
import SearchBar from "@/app/components/ui/SearchBar";
import ListingCard from "@/app/components/ListingCard";
import type { Listing } from "@/app/actions/listings";

type HomeProps = {
  listings: Listing[];
  currentUserId?: string;
  searchQuery?: string;
};

export default function Home({
  listings,
  currentUserId,
  searchQuery = "",
}: HomeProps) {
  return (
    <div>
      <header className="py-6 flex justify-between items-center">
        <Logo />
        <Suspense fallback={<div className="flex-1 max-w-md mx-4" />}>
          <SearchBar />
        </Suspense>
        <Nav />
      </header>
      <main className="pt-10">
        <h1 className="text-4xl font-bold mb-8">Browse Gear</h1>

        {listings.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            {searchQuery.trim()
              ? `No listings found matching "${searchQuery}"`
              : "No listings available yet. Be the first to share your gear!"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price_per_day={listing.price_per_day}
                location={listing.location}
                condition={listing.condition}
                image_url={listing.image_url}
                isOwner={currentUserId === listing.owner_id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
