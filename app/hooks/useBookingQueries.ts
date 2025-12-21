"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getApprovedBookingsByListingId,
  getPendingBookingForListing,
} from "@/app/actions/bookings";

export function useApprovedBookings(listingId: string) {
  return useQuery({
    queryKey: ["approvedBookings", listingId],
    queryFn: () => getApprovedBookingsByListingId(listingId),
    enabled: !!listingId,
  });
}

export function usePendingBooking(listingId: string) {
  return useQuery({
    queryKey: ["pendingBooking", listingId],
    queryFn: () => getPendingBookingForListing(listingId),
    enabled: !!listingId,
  });
}
