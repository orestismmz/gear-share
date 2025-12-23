"use server";

import { createClient } from "@/app/lib/supabase/server";

export type AuthContext = {
  userId: string | null;
  /**
   * A non-sensitive value that changes when auth session changes/refreshes.
   * Used only for query key partitioning to avoid cross-session cache bleed.
   */
  sessionVersion: string;
};

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = user?.id ?? null;

  // Don't leak tokens to the client. Use a safe "version" signal.
  // expires_at changes when session refreshes; combined with userId it's enough
  // to partition caches across users/sessions.
  const sessionVersion = `${userId ?? "anon"}:${session?.expires_at ?? 0}`;

  return { userId, sessionVersion };
}
