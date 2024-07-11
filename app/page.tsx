import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import { ModeToggle } from "@/components/mode-toggle";
import HlsControl from "@/components/hlsControl";
import Followed from "@/components/followed";
import PlaylistUrl from "@/components/PlaylistUrl";

export default async function Index() {
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  const supabase = createClient();

  const session = await supabase.auth.getSession();
  const token = session.data.session?.provider_token;
  const userId = session.data.session?.user.user_metadata.provider_id;
  const clientId = process.env.TWITCH_CLIENT_ID;

  const res = await fetch(
    `https://api.twitch.tv/helix/streams/followed?user_id=${userId}`,
    {
      method: "GET",
      headers: {
        "Client-ID": `${clientId}`,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await res.json();
  console.log(data);

  const { error } = await supabase
    .from("streams")
    .upsert(
      { user_id: session.data.session?.user.id, streams: data },
      { onConflict: "user_id" }
    );

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm gap-2">
          {isSupabaseConnected && <AuthButton />}

          <ModeToggle />
        </div>
      </nav>

      <main className="w-full max-w-4xl">
        {isSupabaseConnected && <PlaylistUrl id={session.data.session?.user.id} />}

        <Followed data={data.data} />
      </main>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Created by{" "}
          <a
            href="https://github.com/silviotron"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Silviotron
          </a>
        </p>
      </footer>
    </div>
  );
}
