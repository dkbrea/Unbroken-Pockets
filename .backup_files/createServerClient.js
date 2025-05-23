import { createClient, } from "@supabase/supabase-js";
import { VERSION } from "./version";
import { createStorageFromOptions, applyServerStorage } from "./cookies";
export function createServerClient(supabaseUrl, supabaseKey, options) {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error(`Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`);
    }
    const { storage, getAll, setAll, setItems, removedItems } = createStorageFromOptions({
        ...options,
        cookieEncoding: options?.cookieEncoding ?? "base64url",
    }, true);
    const client = createClient(supabaseUrl, supabaseKey, {
        ...options,
        global: {
            ...options?.global,
            headers: {
                ...options?.global?.headers,
                "X-Client-Info": `supabase-ssr/${VERSION} createServerClient`,
            },
        },
        auth: {
            ...(options?.cookieOptions?.name
                ? { storageKey: options.cookieOptions.name }
                : null),
            ...options?.auth,
            flowType: "pkce",
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: true,
            storage,
        },
    });
    client.auth.onAuthStateChange(async (event) => {
        // The SIGNED_IN event is fired very often, but we don't need to
        // apply the storage each time it fires, only if there are changes
        // that need to be set -- which is if setItems / removeItems have
        // data.
        const hasStorageChanges = Object.keys(setItems).length > 0 || Object.keys(removedItems).length > 0;
        if (hasStorageChanges &&
            (event === "SIGNED_IN" ||
                event === "TOKEN_REFRESHED" ||
                event === "USER_UPDATED" ||
                event === "PASSWORD_RECOVERY" ||
                event === "SIGNED_OUT" ||
                event === "MFA_CHALLENGE_VERIFIED")) {
            await applyServerStorage({ getAll, setAll, setItems, removedItems }, {
                cookieOptions: options?.cookieOptions ?? null,
                cookieEncoding: options?.cookieEncoding ?? "base64url",
            });
        }
    });
    return client;
}
//# sourceMappingURL=createServerClient.js.map