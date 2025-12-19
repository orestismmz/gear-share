"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type BookingStatus =
  | "pending"
  | "approved"
  | "declined"
  | "cancelled"
  | "completed";

export type CreateBookingInput = {
  listing_id: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
};

export type Booking = {
  id: string;
  listing_id: string;
  borrower_id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  price_per_day_at_booking: number;
  total_price: number;
  created_at: string;
};

export type BookingWithListingInfo = {
  id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  price_per_day_at_booking: number;
  total_price: number;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price_per_day: number;
    location: string;
    owner_id: string;
    image_url: string | null;
  } | null;
};

export type BookingWithListingAndProfileInfo = {
  id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  price_per_day_at_booking: number;
  total_price: number;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price_per_day: number;
    location: string;
    owner_id: string;
    image_url: string | null;
    owner_profile: {
      firstname: string;
      lastname: string;
      username: string;
    } | null;
  } | null;
};

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

  // Get the listing to capture the current price
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("price_per_day")
    .eq("id", input.listing_id)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found" };
  }

  // Calculate the number of days and total price
  const startDate = new Date(input.start_date);
  const endDate = new Date(input.end_date);
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = listing.price_per_day * days;

  // Insert the booking
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      listing_id: input.listing_id,
      borrower_id: user.id,
      start_date: input.start_date,
      end_date: input.end_date,
      status: "approved",
      price_per_day_at_booking: listing.price_per_day,
      total_price: totalPrice,
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

export async function getMyBookingsWithListingInfo(): Promise<
  BookingWithListingInfo[]
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      start_date,
      end_date,
      status,
      price_per_day_at_booking,
      total_price,
      created_at,
      listing:listings!bookings_listing_id_fkey (
        id,
        title,
        price_per_day,
        location,
        owner_id,
        image_url
      )
    `
    )
    .eq("borrower_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings with listing info:", error);
    return [];
  }

  // Transform the data to match our type
  const bookingsWithListingInfo = (data ?? []).map((booking) => ({
    ...booking,
    listing: Array.isArray(booking.listing)
      ? (booking.listing[0] ?? null)
      : booking.listing,
  }));

  return bookingsWithListingInfo as BookingWithListingInfo[];
}

export async function getBookingById(
  bookingId: string
): Promise<BookingWithListingAndProfileInfo | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      start_date,
      end_date,
      status,
      price_per_day_at_booking,
      total_price,
      created_at,
      listing:listings!bookings_listing_id_fkey (
        id,
        title,
        price_per_day,
        location,
        owner_id,
        image_url,
        owner_profile:profiles!listings_owner_id_fkey (
          firstname,
          lastname,
          username
        )
      )
    `
    )
    .eq("id", bookingId)
    .eq("borrower_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching booking:", error);
    return null;
  }

  // Transform the data to match our type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let listing: any = Array.isArray(data.listing)
    ? (data.listing[0] ?? null)
    : data.listing;

  if (listing && listing.owner_profile) {
    const ownerProfile = Array.isArray(listing.owner_profile)
      ? (listing.owner_profile[0] ?? null)
      : listing.owner_profile;

    listing = {
      ...listing,
      owner_profile: ownerProfile,
    };
  }

  return {
    id: data.id,
    start_date: data.start_date,
    end_date: data.end_date,
    status: data.status,
    price_per_day_at_booking: data.price_per_day_at_booking,
    total_price: data.total_price,
    created_at: data.created_at,
    listing,
  } as BookingWithListingAndProfileInfo;
}
