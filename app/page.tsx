import Logo from "@/app/components/ui/Logo";
import Nav from "@/app/components/ui/Nav";
import ListingCard from "@/app/components/ui/ListingCard";
import { getAllListings } from "@/app/actions/listings";

export default async function Home() {
  const listings = await getAllListings()

  return (
    <div>
      <header className="py-6 flex justify-between items-center">
        <Logo />
        <Nav />
      </header>
      <main>
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
              />
            ))}
          </div>
        )}
      </main>
    </div>  
  );
}
