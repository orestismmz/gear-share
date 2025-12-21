"use client";

import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "@/app/actions/bookings";

export function useBookingById(bookingId: string) {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
  });
}
