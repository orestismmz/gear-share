"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveBooking,
  declineBooking,
  cancelBooking,
  deletePendingBooking,
  removeBookingFromList,
  BookingStatus,
} from "@/app/actions/bookings";

export function useBookingStatusMutations(bookingId: string) {
  const queryClient = useQueryClient();
  const key = ["booking", bookingId] as const;

  const invalidateListingBookingQueries = (listingId?: string | null) => {
    if (!listingId) return;
    // These two queries drive the listing page booking UI.
    queryClient.invalidateQueries({ queryKey: ["pendingBooking", listingId] });
    queryClient.invalidateQueries({
      queryKey: ["approvedBookings", listingId],
    });
  };

  const setStatus = (status: BookingStatus) => {
    queryClient.setQueryData(key, (old: any) => {
      // If old isn't there yet, create minimal shape so banner can update
      if (!old) return { id: bookingId, status };
      return { ...old, status };
    });
  };

  const approve = useMutation({
    mutationFn: async () => {
      const res = await approveBooking(bookingId);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      setStatus("approved");
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(key, ctx?.previous);
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: key });
      invalidateListingBookingQueries((data as any)?.listing_id);
    },
  });

  const decline = useMutation({
    mutationFn: async () => {
      const res = await declineBooking(bookingId);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      setStatus("declined");
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(key, ctx?.previous);
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: key });
      invalidateListingBookingQueries((data as any)?.listing_id);
    },
  });

  const cancel = useMutation({
    mutationFn: async () => {
      const res = await cancelBooking(bookingId);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      setStatus("cancelled");
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(key, ctx?.previous);
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: key });
      invalidateListingBookingQueries((data as any)?.listing_id);
    },
  });

  const deletePending = useMutation({
    mutationFn: async () => {
      const res = await deletePendingBooking(bookingId);
      if (res.error) throw new Error(res.error);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      const listingIdFromPrevious = (previous as any)?.listing?.id ?? null;
      queryClient.setQueryData(key, null);
      return { previous, listingIdFromPrevious };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(key, ctx?.previous);
    },
    onSettled: (_data, _error, _vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: key });
      invalidateListingBookingQueries((ctx as any)?.listingIdFromPrevious);
    },
  });

  const removeFromList = useMutation({
    mutationFn: async () => {
      const res = await removeBookingFromList(bookingId);
      if (res.error) throw new Error(res.error);
    },
  });

  return { approve, decline, cancel, deletePending, removeFromList };
}
