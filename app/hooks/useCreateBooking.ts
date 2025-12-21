"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  CreateBookingInput,
  Booking,
} from "@/app/actions/bookings";

type MutationContext = {
  previous: unknown;
};

export function useCreateBooking(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CreateBookingInput, MutationContext>({
    mutationFn: async (input) => {
      const result = await createBooking(input);
      if (result.error) throw new Error(result.error);
      if (!result.data) throw new Error("No data returned from server");
      return result.data;
    },

    // Optional: optimistic UI (so button switches instantly)
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: ["pendingBooking", listingId],
      });

      const previous = queryClient.getQueryData(["pendingBooking", listingId]);

      queryClient.setQueryData(["pendingBooking", listingId], {
        id: "__optimistic__",
        start_date: input.start_date,
        end_date: input.end_date,
      });

      return { previous };
    },

    onError: (_err, _input, ctx) => {
      // rollback optimistic
      queryClient.setQueryData(
        ["pendingBooking", listingId],
        ctx?.previous ?? null
      );
    },

    onSuccess: (booking) => {
      // replace optimistic with real booking data
      queryClient.setQueryData(["pendingBooking", listingId], {
        id: booking.id,
        start_date: booking.start_date,
        end_date: booking.end_date,
      });
    },

    onSettled: () => {
      // ensure server is the final truth
      queryClient.invalidateQueries({
        queryKey: ["pendingBooking", listingId],
      });
      // approved bookings don't change from a pending request, so this is optional:
      // queryClient.invalidateQueries({ queryKey: ["approvedBookings", listingId] });
    },
  });
}
