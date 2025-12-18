import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/components/auth/LogoutButton";
import Button from "@/app/components/ui/Button";
import { getListingsByUsername } from "@/app/actions/listings";
import ListingCard from "@/app/components/ui/ListingCard";
import { User } from "lucide-react";

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Redirect to sign-in if not authenticated
    redirect("/sign-in");
  }

  // Fetch the user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, firstname, lastname")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>
            Error loading profile:{" "}
            {profileError?.message || "Profile not found"}
          </p>
        </div>
      </div>
    );
  }

  // Fetch the user's listings
  const listings = await getListingsByUsername(profile.username);

  const displayName =
    profile.firstname && profile.lastname
      ? `${capitalizeFirstLetter(profile.firstname)} ${capitalizeFirstLetter(profile.lastname)}`
      : profile.username;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center pb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full border-2 border-secondary p-3">
            <User size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{displayName}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/create-listing">
            <Button>Create Listing</Button>
          </Link>
          <LogoutButton />
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Your Listings</h2>

      {listings.length === 0 ? (
        <p className="text-gray-600 text-center py-12">
          You haven't posted any listings yet. Create your first listing to get
          started!
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
    </div>
  );
}
