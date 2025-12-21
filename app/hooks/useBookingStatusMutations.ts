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
  const qc = useQueryClient();
  const key = ["booking", bookingId] as const;

  const setStatus = (status: BookingStatus) => {
    qc.setQueryData(key, (old: any) => {
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
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      setStatus("approved");
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(key, ctx?.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const decline = useMutation({
    mutationFn: async () => {
      const res = await declineBooking(bookingId);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      setStatus("declined");
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(key, ctx?.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const cancel = useMutation({
    mutationFn: async () => {
      const res = await cancelBooking(bookingId);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      setStatus("cancelled");
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(key, ctx?.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const deletePending = useMutation({
    mutationFn: async () => {
      const res = await deletePendingBooking(bookingId);
      if (res.error) throw new Error(res.error);
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, null);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(key, ctx?.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
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
