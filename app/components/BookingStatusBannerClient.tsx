"use client";

import { BookingStatus } from "@/app/actions/bookings";
import { useBookingById } from "@/app/hooks/useBookingById";

function getStatusStyles(status: BookingStatus) {
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
}

export default function BookingStatusBannerClient({
  bookingId,
  initialStatus,
}: {
  bookingId: string;
  initialStatus: BookingStatus;
}) {
  const { data: booking } = useBookingById(bookingId);

  // Use live status if available; fall back to server-rendered initial status
  const status = booking?.status ?? initialStatus;

  return (
    <div className={`mb-6 p-4 rounded-lg border-2 ${getStatusStyles(status)}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold uppercase">Status:</span>
        <span className="text-lg font-bold uppercase">{status}</span>
      </div>
    </div>
  );
}

