import Link from 'next/link'

interface ListingCardProps {
  id: string
  title: string
  price_per_day: number
  location: string
}

export default function ListingCard({ id, title, price_per_day, location }: ListingCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <div className="flex justify-between items-center mt-4">
          <p className="text-xl font-bold text-primary">{price_per_day} DKK/day</p>
          <p className="text-sm text-gray-600 capitalize">{location}</p>
        </div>
      </div>
    </Link>
  )
}

