"use server";

import { createClient } from "@/app/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Listing = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  price_per_day: number;
  condition: string;
  location: string;
  category: string;
  image_url: string | null;
  created_at: string;
  profiles?: {
    username: string;
  };
};

export async function createListing(formData: FormData) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to create a listing" };
  }

  // Extract form data
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const price_per_day = parseFloat(formData.get("price_per_day") as string);
  const condition = formData.get("condition") as string;
  const location = formData.get("location") as string;
  const category = formData.get("category") as string;
  const imageFile = formData.get("image") as File;

  // Validate required fields
  if (!title || !price_per_day || !condition || !location || !category) {
    return { error: "Missing required fields" };
  }

  if (!imageFile || imageFile.size === 0) {
    return { error: "Image is required" };
  }

  // Insert the listing first (without image_url)
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      title,
      description,
      price_per_day,
      condition,
      location,
      category,
    })
    .select()
    .single();

  if (listingError) {
    return { error: listingError.message };
  }

  // Upload image to storage with path: {user_id}/{listing_id}/{filename}
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${listing.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("listing_images")
    .upload(filePath, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    // If upload fails, delete the listing
    await supabase.from("listings").delete().eq("id", listing.id);
    return { error: `Failed to upload image: ${uploadError.message}` };
  }

  // Get the public URL for the uploaded image
  const {
    data: { publicUrl },
  } = supabase.storage.from("listing_images").getPublicUrl(filePath);

  // Update the listing with the image URL
  const { error: updateError } = await supabase
    .from("listings")
    .update({ image_url: publicUrl })
    .eq("id", listing.id);

  if (updateError) {
    return {
      error: `Failed to update listing with image: ${updateError.message}`,
    };
  }

  // Revalidate and redirect to profile or listings page
  revalidatePath("/profile");
  redirect("/profile");
}

export async function getAllListings(): Promise<Listing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data || [];
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      profiles (
        username
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching listing:", error);
    return null;
  }

  return data;
}

export async function getListingsByUsername(
  username: string
): Promise<Listing[]> {
  const supabase = await createClient();

  // First, get the user's profile by username
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError);
    return [];
  }

  // Then get all listings by that user
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return data || [];
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be authenticated to delete a listing" };
  }

  // First, get the listing to verify ownership and get image URL
  const { data: listing, error: fetchError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (fetchError) {
    return { error: "Listing not found" };
  }

  // Check if the user is the owner
  if (listing.owner_id !== user.id) {
    return { error: "You are not authorized to delete this listing" };
  }

  // Delete associated images from storage
  if (listing.image_url) {
    const filePath = `${user.id}/${listing.id}`;
    const { error: deleteFilesError } = await supabase.storage
      .from("listing_images")
      .remove([filePath]);

    if (deleteFilesError) {
      console.error("Error deleting images:", deleteFilesError);
      // Continue with listing deletion even if file deletion fails
    }
  }

  // Delete the listing
  const { error: deleteError } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId);

  if (deleteError) {
    return { error: `Failed to delete listing: ${deleteError.message}` };
  }

  revalidatePath("/profile");
  redirect("/profile");
}
