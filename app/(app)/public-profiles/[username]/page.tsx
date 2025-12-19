import { getListingsByUsername } from "@/app/actions/listings";
import { getProfileByUsername } from "@/app/actions/profiles";
import ListingCard from "@/app/components/ui/ListingCard";
import { notFound } from "next/navigation";
import { User } from "lucide-react";

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const [profile, listings] = await Promise.all([
    getProfileByUsername(username),
    getListingsByUsername(username),
  ]);

  if (!profile) {
    notFound();
  }

  const displayName =
    profile.firstname && profile.lastname
      ? `${capitalizeFirstLetter(profile.firstname)} ${capitalizeFirstLetter(profile.lastname)}`
      : username;

  return (
    <div className="p-4">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full border-2 border-secondary p-3">
            <User size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{displayName}</h1>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Listings</h2>

      {listings.length === 0 ? (
        <p className="text-gray-600 text-center py-12">
          This user hasn't posted any listings yet.
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
