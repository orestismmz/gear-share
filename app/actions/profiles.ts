"use server";

import { createClient } from "@/app/lib/supabase/server";

export interface Profile {
  id: string;
  username: string;
  firstname: string | null;
  lastname: string | null;
}

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, firstname, lastname")
    .eq("username", username)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}
