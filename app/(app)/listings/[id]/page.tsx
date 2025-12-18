import { getListingById } from "@/app/actions/listings";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookingSection from "@/app/components/BookingSection";
import { User } from "lucide-react";

interface ListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6">{listing.title}</h1>

        {listing.description && (
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>
        )}

        <div className="flex justify-between gap-6 mb-6">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col  gap-6 border-gray-200">
              {listing.profiles && (
                <Link href={`/public-profiles/${listing.profiles.username}`}>
                  <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="rounded-full border-2 border-secondary p-1.5">
                      <User size={20} className="text-primary" />
                    </div>
                    <span className="font-medium text-gray-600">
                      {listing.profiles.username}
                    </span>
                  </div>
                </Link>
              )}
              <div className="text-sm text-gray-500">
                Listed on{" "}
                {new Date(listing.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                Price per day
              </h2>
              <p className="text-2xl font-bold text-primary">
                {listing.price_per_day} DKK
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                Location
              </h2>
              <p className="text-xl capitalize">{listing.location}</p>
            </div>

            {/* <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                Category
              </h2>
              <p className="text-xl capitalize">{listing.category}</p>
            </div> */}

            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                Condition
              </h2>
              <p className="text-xl capitalize">
                {listing.condition.replace("_", " ")}
              </p>
            </div>
          </div>
          <BookingSection listingId={listing.id} />
        </div>
      </div>
    </div>
  );
}
