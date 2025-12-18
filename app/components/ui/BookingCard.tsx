import Link from "next/link";

interface BookingCardProps {
  bookingId: string;
  listingId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
}

export default function BookingCard({
  bookingId,
  listingId,
  title,
  location,
  startDate,
  endDate,
}: BookingCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB");

  return (
    <Link href={`/bookings/${bookingId}`}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
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
    </Link>
  );
}
