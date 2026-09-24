import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Typed client for reads (select)
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// Untyped client for mutations (insert/update/delete) — avoids Postgrest v14 never types
export function createMutationClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
