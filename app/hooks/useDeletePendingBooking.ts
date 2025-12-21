"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePendingBooking } from "@/app/actions/bookings";

type MutationContext = {
  previous: unknown;
};

export function useDeletePendingBooking(listingId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (bookingId: string) => {
      const result = await deletePendingBooking(bookingId);
      if (result.error) throw new Error(result.error);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["pendingBooking", listingId],
      });
      const previous = queryClient.getQueryData(["pendingBooking", listingId]);

      // optimistic: remove pending booking immediately
      queryClient.setQueryData(["pendingBooking", listingId], null);

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      // rollback
      queryClient.setQueryData(
        ["pendingBooking", listingId],
        ctx?.previous ?? null
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["pendingBooking", listingId],
      });
    },
  });
}
