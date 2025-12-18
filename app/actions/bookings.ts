"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateBookingInput {
  listing_id: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
}

export interface Booking {
  id: string;
  listing_id: string;
  borrower_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to create a booking" };
  }

  // Insert the booking
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      listing_id: input.listing_id,
      borrower_id: user.id,
      start_date: input.start_date,
      end_date: input.end_date,
    })
    .select()
    .single();

  if (error) {
    // Check if it's an overlap constraint violation
    if (error.code === "23P01") {
      return {
        error: "These dates are already booked. Please select different dates.",
      };
    }
    return { error: error.message };
  }

  // Revalidate the listing page
  revalidatePath(`/listings/${input.listing_id}`);

  return { data, error: null };
}

export async function getBookingsByListingId(
  listingId: string
): Promise<Booking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("listing_id", listingId)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
}
