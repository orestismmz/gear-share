import Logo from "@/app/components/ui/Logo";
import Nav from "@/app/components/ui/Nav";
import ListingCard from "@/app/components/ui/ListingCard";
import { getAllListings } from "@/app/actions/listings";
import { createClient } from "@/app/lib/supabase/server";

export default async function Home() {
  const listings = await getAllListings();

  // Get current user to check ownership
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUserId = user?.id;

  return (
    <div>
      <header className="py-6 flex justify-between items-center">
        <Logo />
        <Nav />
      </header>
      <main className="pt-10">
        <h1 className="text-4xl font-bold mb-8">Browse Gear</h1>

        {listings.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            No listings available yet. Be the first to share your gear!
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
