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
  const user = await supabase.auth.getUser();
  const loged = user.data.user != null;
  const session = await supabase.auth.getSession();

  const clientId = process.env.TWITCH_CLIENT_ID;
  const twitchToken = process.env.TWITCH_TOKEN;
  const streams: any[] = [];

  try {
    if (loged) {
      const token = session.data.session?.provider_token;
      const userId = session.data.session?.user.user_metadata.provider_id;
      const { data, error } = await supabase
        .from("followed")
        .select("followed")
        .eq("user_id", session.data.session?.user.id);
      if (error) {
        throw error;
      }
      if (!(data && data.length > 0)) {
        throw error;
      }

      const followedList = data[0].followed;

      const array = followedList;
      if (!array) {
        throw error;
      }

      const SIZE = 100;
      let page = 0;

      while (array.length + 100 > (page + 1) * SIZE) {
        let userLogins =
          `&user_login=` +
          array.slice(page * SIZE, page * SIZE + 100).join(`&user_login=`);

        const respuesta = await fetch(
          `https://api.twitch.tv/helix/streams?first=100${userLogins}`,
          {
            method: "GET",
            headers: {
              "Client-ID": `${clientId}`,
              Authorization: `Bearer ${twitchToken}`,
            },
          }
        );

        const datos = await respuesta.json();
        datos.data.map((stream: any) => {
          streams.push(stream);
        });
        page++;
      }

      streams.sort((a, b) => b.viewer_count - a.viewer_count);
    } else {
      const respuesta = await fetch(`https://api.twitch.tv/helix/streams?first=100`, {
        method: "GET",
        headers: {
          "Client-ID": `${clientId}`,
          Authorization: `Bearer ${twitchToken}`,
        },
      });
      const datos = await respuesta.json();
      datos.data.map((stream: any) => {
        streams.push(stream);
      });
    }
    const promises = streams.map(async (stream) => {
      try {
        const respuesta = await fetch(
          `https://api.twitch.tv/helix/users?login=${stream.user_login}`,
          {
            method: "GET",
            headers: {
              "Client-ID": `${clientId}`,
              Authorization: `Bearer ${twitchToken}`,
            },
          }
        );

        const datos = await respuesta.json();
        stream.img = datos.data[0].profile_image_url;
      } catch (err) {
        console.error(err);
        // No hacer nada si hay un error (probablemente el streamer no está en directo)
      }
    });

    // Espera a que todas las promesas se resuelvan
    await Promise.all(promises);
  } catch (error) {}

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

        <Followed data={streams} />
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
