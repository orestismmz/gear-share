import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface BookingCardProps {
  bookingId: string;
  listingId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
}

export default function BookingCard({
  bookingId,
  listingId,
  title,
  location,
  startDate,
  endDate,
  imageUrl,
}: BookingCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB");

  return (
    <Link href={`/bookings/${bookingId}`}>
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          ) : (
            <ImageIcon size={64} className="text-gray-400" />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-sm text-gray-600 capitalize">{location}</p>
            <p className="text-sm">
              <span className="text-primary">{formatDate(startDate)}</span>
              <span className="text-gray-600"> - </span>
              <span className="text-primary">{formatDate(endDate)}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
