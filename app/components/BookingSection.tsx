"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import DateRangePicker from "./ui/DateRangePicker";
import Button from "./ui/Button";
import { createBooking, getBookingsByListingId } from "@/app/actions/bookings";
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

  // Fetch existing bookings on mount
  useEffect(() => {
    async function fetchBookings() {
      const data = await getBookingsByListingId(listingId);

      // Calculate all disabled dates from bookings
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
    }

    fetchBookings();
  }, [listingId]);

  const handleDateSelect = (range: DateRange | undefined) => {
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
      setSelectedRange(undefined);
      // Refresh bookings and recalculate disabled dates
      const data = await getBookingsByListingId(listingId);

      const disabled: Date[] = [];
      data.forEach((booking) => {
        const start = parseISO(booking.start_date);
        const end = parseISO(booking.end_date);
        const datesInRange = eachDayOfInterval({ start, end });
        disabled.push(...datesInRange);
      });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      disabled.push({ before: today } as any);
      setDisabledDates(disabled);
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
          Selected: {selectedRange.from.toLocaleDateString()} -{" "}
          {selectedRange.to.toLocaleDateString()}
        </div>
      )}

      <Button
        onClick={handleBooking}
        disabled={!selectedRange?.from || !selectedRange?.to || isLoading}
        className="w-full"
      >
        {isLoading ? "Booking..." : "Book"}
      </Button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg w-full text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg w-full text-center">
          Booking successful!
        </div>
      )}
    </div>
  );
}
