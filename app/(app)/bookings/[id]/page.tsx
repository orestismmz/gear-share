import { getBookingById } from "@/app/actions/bookings";
import { redirect } from "next/navigation";
import { MapPin, User, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB");
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking || !booking.listing) {
    redirect("/profile");
  }

  const ownerProfile = booking.listing.owner_profile;
  const ownerName =
    ownerProfile && ownerProfile.firstname && ownerProfile.lastname
      ? `${capitalizeFirstLetter(ownerProfile.firstname)} ${capitalizeFirstLetter(ownerProfile.lastname)}`
      : ownerProfile?.username || "Unknown Owner";

  return (
    <div className="pt-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Details
        </h1>
        <p className="text-sm text-gray-500">
          Booking ID: <span className="font-mono">{booking.id}</span>
        </p>
      </div>

      <div className="mb-8 p-6 flex flex-col gap-10 bg-gray-50 rounded-lg border border-gray-200">
        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {booking.listing.image_url ? (
            <Image
              src={booking.listing.image_url}
              alt={booking.listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <ImageIcon size={96} className="text-gray-400" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            {booking.listing.title}
          </h2>
          <p className="text-gray-600 capitalize flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            {booking.listing.location}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider ">
            Rental Period
          </h2>
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-sm text-gray-600">From: </span>
              <span className="text-md font-semibold text-primary">
                {formatDate(booking.start_date)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">To: </span>
              <span className="text-md font-semibold text-primary">
                {formatDate(booking.end_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider ">
            Total Price
          </h2>
          <p className="text-md font-semibold text-primary">
            {booking.total_price} DKK
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Listed By
          </h2>
          <Link
            href={`/public-profiles/${ownerProfile?.username || ""}`}
            className="flex items-center gap-4 w-fit"
          >
            <div className="rounded-full border-2 border-secondary p-3 bg-white">
              <User size={32} className="text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{ownerName}</p>
              <p className="text-sm text-gray-500">View profile</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
