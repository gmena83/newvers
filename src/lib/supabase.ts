import { createClient, SupabaseClient } from "@supabase/supabase-js";

function isValidUrl(val: string | undefined): val is string {
    return !!val && val.startsWith("http");
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_client) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!isValidUrl(url) || !key) {
            throw new Error("Supabase environment variables are not configured.");
        }
        _client = createClient(url, key);
    }
    return _client;
}

// Client-side singleton — only created when env vars are real URLs
const _url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
    typeof window !== "undefined" && isValidUrl(_url) && _key
        ? createClient(_url, _key)
        : null;
