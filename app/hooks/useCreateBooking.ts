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

export function useCreateBooking(
  listingId: string,
  userId: string | null,
  sessionVersion: string
) {
  const queryClient = useQueryClient();
  const pendingKey = [
    "pendingBooking",
    listingId,
    userId,
    sessionVersion,
  ] as const;

  return useMutation<Booking, Error, CreateBookingInput, MutationContext>({
    mutationFn: async (input) => {
      const result = await createBooking(input);
      if (result.error) throw new Error(result.error);
      if (!result.data) throw new Error("No data returned from server");
      return result.data;
    },

    // Optional: optimistic UI (so button switches instantly)
    onMutate: async (input) => {
      // If userId isn't ready yet, skip optimistic cache work.
      if (!userId) return { previous: undefined };

      await queryClient.cancelQueries({ queryKey: pendingKey });

      const previous = queryClient.getQueryData(pendingKey);

      queryClient.setQueryData(pendingKey, {
        id: "__optimistic__",
        start_date: input.start_date,
        end_date: input.end_date,
      });

      return { previous };
    },

    onError: (_err, _input, ctx) => {
      if (!userId) return;
      // rollback optimistic
      queryClient.setQueryData(pendingKey, ctx?.previous ?? null);
    },

    onSuccess: (booking) => {
      if (!userId) return;
      // replace optimistic with real booking data
      queryClient.setQueryData(pendingKey, {
        id: booking.id,
        start_date: booking.start_date,
        end_date: booking.end_date,
      });
    },

    onSettled: () => {
      // ensure server is the final truth
      // Use prefix so it matches any userId-suffixed key.
      queryClient.invalidateQueries({
        queryKey: ["pendingBooking", listingId],
      });
      // approved bookings don't change from a pending request, so this is optional:
      // queryClient.invalidateQueries({ queryKey: ["approvedBookings", listingId] });
    },
  });
}
