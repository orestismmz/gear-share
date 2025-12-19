"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "./ui/DateRangePicker";
import Button from "./ui/Button";
import {
  createBooking,
  getApprovedBookingsByListingId,
  getPendingBookingForListing,
  deletePendingBooking,
} from "@/app/actions/bookings";
import { eachDayOfInterval, parseISO, format } from "date-fns";

interface BookingSectionProps {
  listingId: string;
}

export default function BookingSection({ listingId }: BookingSectionProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    id: string;
    start_date: string;
    end_date: string;
  } | null>(null);

  // Fetch approved/completed bookings and check for pending booking on mount
  useEffect(() => {
    async function fetchBookings() {
      // Get approved and completed bookings
      const data = await getApprovedBookingsByListingId(listingId);

      // Calculate all disabled dates from approved and completed bookings
      const disabled: Date[] = [];
      data.forEach((booking) => {
        const start = parseISO(booking.start_date);
        const end = parseISO(booking.end_date);
        const datesInRange = eachDayOfInterval({ start, end });
        disabled.push(...datesInRange);
      });

      // Also disable past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      disabled.push({ before: today } as any);

      setDisabledDates(disabled);

      // Check if user has a pending booking for this listing
      const pending = await getPendingBookingForListing(listingId);
      if (pending) {
        setPendingBooking(pending);
        // Pre-select the pending booking dates
        setSelectedRange({
          from: new Date(pending.start_date),
          to: new Date(pending.end_date),
        });
      }
    }

    fetchBookings();
  }, [listingId]);

  const handleDateSelect = (range: DateRange | undefined) => {
    // Don't allow date changes if there's a pending booking
    if (pendingBooking) return;

    setSelectedRange(range);
    setError(null);
    setSuccess(false);
  };

  const handleBooking = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      setError("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await createBooking({
      listing_id: listingId,
      start_date: format(selectedRange.from, "yyyy-MM-dd"),
      end_date: format(selectedRange.to, "yyyy-MM-dd"),
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      // Store the pending booking
      if (result.data) {
        setPendingBooking({
          id: result.data.id,
          start_date: result.data.start_date,
          end_date: result.data.end_date,
        });
      }
    }
  };

  const handleCancelRequest = async () => {
    if (!pendingBooking) return;

    if (!confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await deletePendingBooking(pendingBooking.id);

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Clear the pending booking and selected dates
      setPendingBooking(null);
      setSelectedRange(undefined);
      setSuccess(false);
    }
  };

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

      {pendingBooking ? (
        <>
          <Button
            onClick={handleCancelRequest}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Cancelling..." : "Cancel Request"}
          </Button>

          <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg w-full text-center">
            Your booking request is pending owner approval.
          </div>
        </>
      ) : (
        <Button
          onClick={handleBooking}
          disabled={!selectedRange?.from || !selectedRange?.to || isLoading}
          className="w-full"
        >
          {isLoading ? "Requesting..." : "Request Booking"}
        </Button>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg w-full text-center">
          {error}
        </div>
      )}

      {success && !pendingBooking && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg w-full text-center">
          Booking requested! Awaiting owner approval.
        </div>
      )}
    </div>
  );
}
