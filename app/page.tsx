import Home from "@/app/components/Home";
import { getAllListings, searchListings } from "@/app/actions/listings";
import { createClient } from "@/app/lib/supabase/server";

type HomeWrapperProps = {
  searchParams: Promise<{ search?: string }>;
};

export default async function HomeWrapper({ searchParams }: HomeWrapperProps) {
  const params = await searchParams;
  const searchQuery = params.search || "";

  // Use server-side search if query exists, otherwise get all listings
  const listings = searchQuery
    ? await searchListings(searchQuery)
    : await getAllListings();

  // Get current user to check ownership
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUserId = user?.id;

  return (
    <Home
      listings={listings}
      currentUserId={currentUserId}
      searchQuery={searchQuery}
    />
  );
}
