import Link from "next/link";

interface BookingCardProps {
  listingId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
}

export default function BookingCard({
  listingId,
  title,
  location,
  startDate,
  endDate,
}: BookingCardProps) {
  return (
    <Link href={`/listings/${listingId}`}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-sm text-gray-600 capitalize">{location}</p>
          <p className="text-sm font-medium text-primary">
            {startDate} → {endDate}
          </p>
        </div>
      </div>
    </Link>
  );
}
