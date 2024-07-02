import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/server";

// Función asincrónica para obtener los canales seguidos
async function fetchFollowedChannels(
  userId: string,
  token: string,
  clientId: string,
  supabase: any
) {
  let followed: any[] = [];

  async function fetchPage(cursor = null) {
    let apiUrl = `https://api.twitch.tv/helix/channels/followed?user_id=${userId}&first=100`;

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

    const data = await res.json();

    if (data.data.length > 0) {
      followed.push(...data.data);
    }

    if (data.pagination && data.pagination.cursor) {
      await fetchPage(data.pagination.cursor);
    }
  }

  await fetchPage();

  const { error } = await supabase.from("followed").insert({ user_id: userId, followed });

  if (error) {
    console.error("Error al guardar los canales seguidos:", error);
  } else {
    console.log("Canales seguidos guardados correctamente:", followed);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
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
      const supabaseClient = createClient();
      const session = await supabaseClient.auth.getSession();
      const token = session.data.session?.provider_token;
      const userId = session.data.session?.user.user_metadata.provider_id;
      const clientId = process.env.TWITCH_CLIENT_ID;

      await fetchFollowedChannels(userId, token, clientId, supabaseClient);

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
