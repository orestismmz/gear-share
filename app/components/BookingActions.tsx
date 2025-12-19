"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import {
  approveBooking,
  declineBooking,
  cancelBooking,
  deletePendingBooking,
  BookingStatus,
} from "@/app/actions/bookings";

type BookingActionsProps = {
  bookingId: string;
  status: BookingStatus;
  startDate: string;
  isOwner: boolean;
  isBorrower: boolean;
};

export default function BookingActions({
  bookingId,
  status,
  startDate,
  isOwner,
  isBorrower,
}: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBeforeStartDate = new Date(startDate) > new Date();

  // Owner can approve/decline pending bookings
  const canApprove = isOwner && status === "pending";
  const canDecline = isOwner && status === "pending";

  // Cancel/Delete logic:
  // - Borrower with pending: DELETE the booking (cancel request)
  // - Borrower with approved: CANCEL (status change) before start date
  // - Owner with approved: CANCEL (status change) before start date (use decline for pending)
  const canCancelOrDelete =
    isBeforeStartDate &&
    ((isBorrower && (status === "pending" || status === "approved")) ||
      (isOwner && status === "approved"));

  const isPendingBorrowerRequest = isBorrower && status === "pending";

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    const result = await approveBooking(bookingId);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setError(null);

    const result = await declineBooking(bookingId);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  };

  const handleCancelOrDelete = async () => {
    const confirmMessage = isPendingBorrowerRequest
      ? "Are you sure you want to cancel this booking request?"
      : "Are you sure you want to cancel this booking?";

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    let result;
    if (isPendingBorrowerRequest) {
      // Delete pending booking
      result = await deletePendingBooking(bookingId);
    } else {
      // Cancel approved booking (status change)
      result = await cancelBooking(bookingId);
    }

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      if (isPendingBorrowerRequest) {
        // Redirect to profile after deleting pending request
        router.push("/profile");
      } else {
        // Just refresh the page for regular cancellations
        router.refresh();
      }
    }
  };

  // Don't show anything if no actions are available
  if (!canApprove && !canDecline && !canCancelOrDelete) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {canApprove && (
          <Button onClick={handleApprove} disabled={isLoading}>
            {isLoading ? "Approving..." : "Approve Booking"}
          </Button>
        )}

        {canDecline && (
          <Button
            onClick={handleDecline}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Declining..." : "Decline Booking"}
          </Button>
        )}

        {canCancelOrDelete && (
          <Button
            onClick={handleCancelOrDelete}
            disabled={isLoading}
            className={
              isPendingBorrowerRequest
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            }
          >
            {isLoading
              ? isPendingBorrowerRequest
                ? "Cancelling..."
                : "Cancelling..."
              : isPendingBorrowerRequest
                ? "Cancel Request"
                : "Cancel Booking"}
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
