"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "./ui/Button";
import { useBookingById } from "@/app/hooks/useBookingById";
import { useBookingStatusMutations } from "@/app/hooks/useBookingStatusMutations";

type Props = {
  bookingId: string;
  isOwner: boolean;
  isBorrower: boolean;
};

export default function BookingActionsClient({
  bookingId,
  isOwner,
  isBorrower,
}: Props) {
  const router = useRouter();

  const { data: booking, isLoading: isBookingLoading } =
    useBookingById(bookingId);
  const { approve, decline, cancel, deletePending, removeFromList } =
    useBookingStatusMutations(bookingId);

  useEffect(() => {
    if (isBookingLoading) return;
    if (!booking) {
      // booking deleted or not found -> go back
      router.push("/profile");
    }
  }, [booking, isBookingLoading, router]);

  if (isBookingLoading || !booking) return null;

  const status = booking.status;
  const startDate = booking.start_date;

  const isBeforeStartDate = new Date(startDate) > new Date();

  const canApprove = isOwner && status === "pending";
  const canDecline = isOwner && status === "pending";

  const canCancelOrDelete =
    isBeforeStartDate &&
    ((isBorrower && (status === "pending" || status === "approved")) ||
      (isOwner && status === "approved"));

  const isPendingBorrowerRequest = isBorrower && status === "pending";

  const canRemoveFromList = status === "cancelled" || status === "declined";

  const anyPending =
    approve.isPending ||
    decline.isPending ||
    cancel.isPending ||
    deletePending.isPending ||
    removeFromList.isPending;

  const handleApprove = () => approve.mutate();
  const handleDecline = () => decline.mutate();

  const handleCancelOrDelete = () => {
    const confirmMessage = isPendingBorrowerRequest
      ? "Are you sure you want to cancel this booking request?"
      : "Are you sure you want to cancel this booking?";

    if (!confirm(confirmMessage)) return;

    if (isPendingBorrowerRequest) {
      deletePending.mutate(undefined, {
        onSuccess: () => router.push("/profile"),
      });
    } else {
      cancel.mutate();
    }
  };

  const handleRemoveFromList = () => {
    if (
      !confirm("Are you sure you want to remove this booking from your list?")
    ) {
      return;
    }

    removeFromList.mutate(undefined, {
      onSuccess: () => router.push("/profile"),
    });
  };

  // if nothing to show, return null
  if (!canApprove && !canDecline && !canCancelOrDelete && !canRemoveFromList)
    return null;

  const error =
    approve.error?.message ||
    decline.error?.message ||
    cancel.error?.message ||
    deletePending.error?.message ||
    removeFromList.error?.message ||
    null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {canApprove && (
          <Button onClick={handleApprove} disabled={anyPending}>
            {approve.isPending ? "Approving..." : "Approve Booking"}
          </Button>
        )}

        {canDecline && (
          <Button
            onClick={handleDecline}
            disabled={anyPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {decline.isPending ? "Declining..." : "Decline Booking"}
          </Button>
        )}

        {canCancelOrDelete && (
          <Button
            onClick={handleCancelOrDelete}
            disabled={anyPending}
            className={
              isPendingBorrowerRequest
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            }
          >
            {anyPending
              ? "Working..."
              : isPendingBorrowerRequest
                ? "Cancel Request"
                : "Cancel Booking"}
          </Button>
        )}

        {canRemoveFromList && (
          <Button
            onClick={handleRemoveFromList}
            disabled={anyPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {removeFromList.isPending ? "Removing..." : "Remove from List"}
          </Button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
