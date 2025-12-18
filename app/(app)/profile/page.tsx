import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/app/components/auth/LogoutButton";
import Button from "@/app/components/ui/Button";
import { getListingsByUsername } from "@/app/actions/listings";
import { getMyBookingsWithListingInfo } from "@/app/actions/bookings";
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

  // Fetch the user's bookings with listing details
  const bookings = await getMyBookingsWithListingInfo();

  const displayName =
    profile.firstname && profile.lastname
      ? `${capitalizeFirstLetter(profile.firstname)} ${capitalizeFirstLetter(profile.lastname)}`
      : profile.username;

  return (
    <div className="pt-10 flex flex-col gap-16">
      <div className="flex justify-between items-center">
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

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold ">Your Listings</h2>

        {listings.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            You haven't posted any listings yet. Create your first listing to
            get started!
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

      <div className="flex flex-col gap-6">
        <h2 className=" text-2xl font-semibold">Your Bookings</h2>

        {bookings.length === 0 ? (
          <p className="text-gray-600 text-center py-12">
            You haven't made any bookings yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bookings.map((b) => (
              <div key={b.id} className="flex flex-col gap-2">
                {b.listing ? (
                  <ListingCard
                    id={b.listing.id}
                    title={b.listing.title}
                    price_per_day={b.listing.price_per_day}
                    location={b.listing.location}
                  />
                ) : (
                  <p>Listing deleted</p>
                )}
                <p className="text-gray-600 text-xs text-right">
                  From {b.start_date} to {b.end_date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
