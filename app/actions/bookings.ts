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
  owner_deleted: boolean;
  borrower_deleted: boolean;
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
  borrower_id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  price_per_day_at_booking: number;
  total_price: number;
  created_at: string;
  borrower_profile: {
    firstname: string;
    lastname: string;
    username: string;
  } | null;
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

  // Insert the booking with pending status (RLS policy requires this)
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      listing_id: input.listing_id,
      borrower_id: user.id,
      start_date: input.start_date,
      end_date: input.end_date,
      status: "pending",
      price_per_day_at_booking: listing.price_per_day,
      total_price: totalPrice,
      owner_deleted: false,
      borrower_deleted: false,
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

export async function getApprovedBookingsByListingId(
  listingId: string
): Promise<Booking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("listing_id", listingId)
    .in("status", ["approved", "completed"])
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching approved bookings:", error);
    return [];
  }

  return data || [];
}

export async function getIncomingBookingRequests(): Promise<
  BookingWithListingInfo[]
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  // Get bookings for listings owned by the current user
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
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching incoming booking requests:", error);
    return [];
  }

  // Filter for listings owned by the current user
  const bookingsForMyListings = (data ?? []).filter((booking) => {
    const listing = Array.isArray(booking.listing)
      ? booking.listing[0]
      : booking.listing;
    return listing && listing.owner_id === user.id;
  });

  // Transform the data to match our type
  const bookingsWithListingInfo = bookingsForMyListings.map((booking) => ({
    ...booking,
    listing: Array.isArray(booking.listing)
      ? (booking.listing[0] ?? null)
      : booking.listing,
  }));

  return bookingsWithListingInfo as BookingWithListingInfo[];
}

export async function getBookingsOnMyListings(): Promise<
  BookingWithListingInfo[]
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  // Get all bookings for listings owned by the current user
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings on my listings:", error);
    return [];
  }

  // Filter for listings owned by the current user
  const bookingsForMyListings = (data ?? []).filter((booking) => {
    const listing = Array.isArray(booking.listing)
      ? booking.listing[0]
      : booking.listing;
    return listing && listing.owner_id === user.id;
  });

  // Transform the data to match our type
  const bookingsWithListingInfo = bookingsForMyListings.map((booking) => ({
    ...booking,
    listing: Array.isArray(booking.listing)
      ? (booking.listing[0] ?? null)
      : booking.listing,
  }));

  return bookingsWithListingInfo as BookingWithListingInfo[];
}

export async function approveBooking(bookingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to approve a booking" };
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "approved" })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error("Error approving booking:", error);
    return { error: error.message };
  }

  // Revalidate relevant pages
  if (data?.listing_id) {
    revalidatePath(`/listings/${data.listing_id}`);
  }
  revalidatePath("/profile");

  return { data, error: null };
}

export async function declineBooking(bookingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to decline a booking" };
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "declined" })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error("Error declining booking:", error);
    return { error: error.message };
  }

  revalidatePath("/profile");

  return { data, error: null };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to cancel a booking" };
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error("Error cancelling booking:", error);
    return { error: error.message };
  }

  // Revalidate relevant pages
  if (data?.listing_id) {
    revalidatePath(`/listings/${data.listing_id}`);
  }
  revalidatePath("/profile");

  return { data, error: null };
}

export async function deletePendingBooking(bookingId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to delete a booking" };
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("borrower_id", user.id)
    .eq("status", "pending");

  if (error) {
    console.error("Error deleting pending booking:", error);
    return { error: error.message };
  }

  return { error: null };
}

export async function getPendingBookingForListing(
  listingId: string
): Promise<{ id: string; start_date: string; end_date: string } | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_date, end_date")
    .eq("listing_id", listingId)
    .eq("borrower_id", user.id)
    .eq("status", "pending")
    .single();

  if (error) {
    // No pending booking found is not an error
    return null;
  }

  return data;
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
      borrower_id,
      start_date,
      end_date,
      status,
      price_per_day_at_booking,
      total_price,
      created_at,
      borrower_profile:profiles!bookings_borrower_id_fkey (
        firstname,
        lastname,
        username
      ),
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

  const borrowerProfile = Array.isArray(data.borrower_profile)
    ? (data.borrower_profile[0] ?? null)
    : data.borrower_profile;

  return {
    id: data.id,
    borrower_id: data.borrower_id,
    start_date: data.start_date,
    end_date: data.end_date,
    status: data.status,
    price_per_day_at_booking: data.price_per_day_at_booking,
    total_price: data.total_price,
    created_at: data.created_at,
    borrower_profile: borrowerProfile,
    listing,
  } as BookingWithListingAndProfileInfo;
}
