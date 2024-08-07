import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const supabase = createClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.provider_token;
      const userId = session.data.session?.user.user_metadata.provider_id;
      const clientId = process.env.TWITCH_CLIENT_ID;

      const url = `https://api.twitch.tv/helix/channels/followed?user_id=${userId}&first=100`; // Request up to 100 channels per page

      let followed: any[] = [];
      let cursor = null;
      let apiData: any;

      do {
        let apiUrl = url;
        if (cursor) {
          apiUrl += `&after=${cursor}`;
        }

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Client-ID": `${clientId}`,
            Authorization: `Bearer ${token}`,
          },
        });

        apiData = await res.json();

        if (apiData.data) {
          followed.push(...apiData.data);
        }

        cursor = apiData.pagination?.cursor;
      } while (cursor);

      const broadcasterLogins = followed.map(
        (item: { broadcaster_login: any }) => item.broadcaster_login
      );

      const { error } = await supabase
        .from("followed")
        .upsert(
          { user_id: session.data.session?.user.id, followed: broadcasterLogins },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Error upserting data:", error);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
