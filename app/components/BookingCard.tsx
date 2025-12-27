import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { BookingStatus } from "@/app/actions/bookings";

interface BookingCardProps {
  bookingId: string;
  listingId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  status: BookingStatus;
}

export default function BookingCard({
  bookingId,
  listingId,
  title,
  location,
  startDate,
  endDate,
  imageUrl,
  status,
}: BookingCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB");

  const getStatusStyles = (status: BookingStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Link href={`/bookings/${bookingId}`}>
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          ) : (
            <ImageIcon size={64} className="text-gray-400" />
          )}
          <div className="absolute bottom-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusStyles(status)}`}
            >
              {status}
            </span>
          </div>
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
