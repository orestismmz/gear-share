"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePendingBooking } from "@/app/actions/bookings";

type MutationContext = {
  previous: unknown;
};

export function useDeletePendingBooking(
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

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (bookingId: string) => {
      const result = await deletePendingBooking(bookingId);
      if (result.error) throw new Error(result.error);
    },

    onMutate: async () => {
      if (!userId) return { previous: undefined };

      await queryClient.cancelQueries({ queryKey: pendingKey });
      const previous = queryClient.getQueryData(pendingKey);

      // optimistic: remove pending booking immediately
      queryClient.setQueryData(pendingKey, null);

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (!userId) return;
      // rollback
      queryClient.setQueryData(pendingKey, ctx?.previous ?? null);
    },

    onSettled: () => {
      // Use prefix so it matches any userId-suffixed key.
      queryClient.invalidateQueries({
        queryKey: ["pendingBooking", listingId],
      });
    },
  });
}
