import { getListingById } from "@/app/actions/listings";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { createClient } from "@/app/lib/supabase/server";
import DeleteListingButton from "@/app/components/DeleteListingButton";

interface EditListingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  // Check if the current user is the owner
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not authenticated or not the owner, redirect to the listing page
  if (!user || listing.owner_id !== user.id) {
    redirect(`/listings/${id}`);
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg p-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <DeleteListingButton listingId={listing.id} />
        </div>

        <div className="relative w-full h-96 mb-6 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <ImageIcon size={128} className="text-gray-400" />
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
              Title
            </h2>
            <p className="text-xl">{listing.title}</p>
          </div>

          {listing.description && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

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

          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
              Category
            </h2>
            <p className="text-xl capitalize">{listing.category}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
              Condition
            </h2>
            <p className="text-xl capitalize">
              {listing.condition.replace("_", " ")}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase mb-2">
              Listed on
            </h2>
            <p className="text-gray-500">
              {new Date(listing.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
