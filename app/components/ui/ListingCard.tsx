import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ListingCardProps {
  id: string;
  title: string;
  price_per_day: number;
  location: string;
  image_url?: string | null;
  isOwner?: boolean;
}

export default function ListingCard({
  id,
  title,
  price_per_day,
  location,
  image_url,
  isOwner = false,
}: ListingCardProps) {
  const href = isOwner ? `/listings/${id}/edit` : `/listings/${id}`;

  return (
    <Link href={href}>
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
          {image_url ? (
            <Image src={image_url} alt={title} fill className="object-cover" />
          ) : (
            <ImageIcon size={64} className="text-gray-400" />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-bold text-primary">
              {price_per_day} DKK
            </p>
            <p className="text-sm text-gray-600 capitalize">{location}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
