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
    // This data can change due to other users' actions (approvals/cancellations),
    // so we keep it fresh on mount.
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePendingBooking(
  listingId: string,
  userId: string | null,
  sessionVersion: string
) {
  return useQuery({
    queryKey: ["pendingBooking", listingId, userId, sessionVersion],
    queryFn: () => getPendingBookingForListing(listingId),
    enabled: !!listingId && !!userId,
    // This is user- and time-sensitive, and can change due to owner actions.
    // Always refetch on mount so we don't show stale "pending" state.
    staleTime: 0,
    refetchOnMount: "always",
  });
}
