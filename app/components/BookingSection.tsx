"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "./ui/DateRangePicker";
import Button from "./ui/Button";
import { eachDayOfInterval, parseISO, format } from "date-fns";
import {
  useApprovedBookings,
  usePendingBooking,
} from "@/app/hooks/useBookingQueries";
import { useCreateBooking } from "@/app/hooks/useCreateBooking";
import { useDeletePendingBooking } from "@/app/hooks/useDeletePendingBooking";

interface BookingSectionProps {
  listingId: string;
  userId: string | null;
  sessionVersion: string;
}

export default function BookingSection({
  listingId,
  userId,
  sessionVersion,
}: BookingSectionProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [error, setError] = useState<string | null>(null);
  const selectedRangeCameFromPendingRef = useRef(false);

  const { data: approvedBookings = [] } = useApprovedBookings(listingId);
  const { data: pendingBooking } = usePendingBooking(
    listingId,
    userId,
    sessionVersion
  );

  const createBookingMutation = useCreateBooking(
    listingId,
    userId,
    sessionVersion
  );
  const deletePendingMutation = useDeletePendingBooking(
    listingId,
    userId,
    sessionVersion
  );

  // Build disabled dates from approved bookings + past dates
  const disabledDates = useMemo(() => {
    const disabled: Date[] = [];

    approvedBookings.forEach((booking) => {
      const start = parseISO(booking.start_date);
      const end = parseISO(booking.end_date);
      disabled.push(...eachDayOfInterval({ start, end }));
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    disabled.push({ before: today } as any);

    return disabled;
  }, [approvedBookings]);

  // If there is a pending booking, pre-select its range
  useEffect(() => {
    if (pendingBooking) {
      setSelectedRange({
        from: new Date(pendingBooking.start_date),
        to: new Date(pendingBooking.end_date),
      });
      selectedRangeCameFromPendingRef.current = true;
      return;
    }

    // If pending booking disappeared (e.g. owner approved/declined),
    // clear the preselected range so the user must choose a new range.
    if (selectedRangeCameFromPendingRef.current) {
      setSelectedRange(undefined);
      selectedRangeCameFromPendingRef.current = false;
    }
  }, [pendingBooking]);

  const handleDateSelect = (range: DateRange | undefined) => {
    if (pendingBooking) return; // lock if pending exists
    selectedRangeCameFromPendingRef.current = false;
    setSelectedRange(range);
    setError(null);
  };

  const handleBooking = () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      setError("Please select both start and end dates");
      return;
    }

    setError(null);

    createBookingMutation.mutate(
      {
        listing_id: listingId,
        start_date: format(selectedRange.from, "yyyy-MM-dd"),
        end_date: format(selectedRange.to, "yyyy-MM-dd"),
      },
      {
        onError: (err) => setError(err.message),
      }
    );
  };

  const handleCancelRequest = () => {
    if (!pendingBooking) return;

    if (pendingBooking.id === "__optimistic__") return; // don't cancel while optimistic id
    if (!confirm("Are you sure you want to cancel this booking request?"))
      return;

    setError(null);

    deletePendingMutation.mutate(pendingBooking.id, {
      onError: (err) => setError(err.message),
      onSuccess: () => setSelectedRange(undefined),
    });
  };

  const hasPending = !!pendingBooking;
  const isOptimisticPending = pendingBooking?.id === "__optimistic__";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-gray-200 p-4 w-fit">
        <DateRangePicker
          selected={selectedRange}
          onSelect={handleDateSelect}
          disabled={disabledDates}
        />
      </div>

      {selectedRange?.from && selectedRange?.to && (
        <div className="text-sm text-gray-600">
          Selected dates: {selectedRange.from.toLocaleDateString()} -{" "}
          {selectedRange.to.toLocaleDateString()}
        </div>
      )}

      {hasPending ? (
        <>
          <Button
            onClick={handleCancelRequest}
            disabled={deletePendingMutation.isPending || isOptimisticPending}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {deletePendingMutation.isPending
              ? "Cancelling..."
              : "Cancel Request"}
          </Button>

          <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg w-full text-center">
            Your booking request is pending owner approval.
          </div>
        </>
      ) : (
        <Button
          onClick={handleBooking}
          disabled={
            !selectedRange?.from ||
            !selectedRange?.to ||
            createBookingMutation.isPending
          }
          className="w-full"
        >
          {createBookingMutation.isPending
            ? "Requesting..."
            : "Request Booking"}
        </Button>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg w-full text-center">
          {error}
        </div>
      )}
    </div>
  );
}
