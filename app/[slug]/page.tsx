import { createClient } from "@/utils/supabase/server";
import { ModeToggle } from "@/components/mode-toggle";
import HlsPlayer from "@/components/hlsPlayer";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import Timer from "@/components/timer";
import Chat from "@/components/chat";
import Tags from "@/components/tags";
import Video from "@/components/video";
import Info from "@/components/info";

import { IoPersonOutline } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";

export default async function Page({ params }: { params: { slug: string } }) {
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

  const clientId = process.env.TWITCH_CLIENT_ID;
  const twitchToken = process.env.TWITCH_TOKEN;

  const users = await fetch(`https://api.twitch.tv/helix/users?login=${params.slug}`, {
    method: "GET",
    headers: {
      "Client-ID": `${clientId}`,
      Authorization: `Bearer ${twitchToken}`,
    },
  });

  let user = await users.json();

  const streams = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${params.slug}`,
    {
      method: "GET",
      headers: {
        "Client-ID": `${clientId}`,
        Authorization: `Bearer ${twitchToken}`,
      },
    }
  );

  let stream = await streams.json();

  user = user.data[0];
  stream = stream.data[0];
  let channel = null;

  if (!stream) {
    const channels = await fetch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${user.id}`,
      {
        method: "GET",
        headers: {
          "Client-ID": `${clientId}`,
          Authorization: `Bearer ${twitchToken}`,
        },
      }
    );

    channel = await channels.json();
    channel = channel.data[0];
  }
  //console.log(user);
  console.log(stream);
  //console.log(channel);
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full h-16 fixed bg-background">
        <div className="max-w-4xl mx-auto flex justify-between items-center h-16 bg-background">
          <div className="flex items-center p-3 text-sm">
            <a className="text-xl hover:text-[#9146FF]" href="/">
              home
            </a>
          </div>
          <div className="flex items-center p-3 text-sm gap-2">
            {isSupabaseConnected && <AuthButton />}
            <ModeToggle />
          </div>
        </div>
      </nav>

      <main className="flex flex-col  w-full  min-h-screen xl:flex-none xl:flex-row ">
        <div className="hidden xl:inline h-[calc(100vh-4rem)]  sticky left-0 top-16 w-[260px]">
          For you
        </div>
        <div className="mt-16 overflow-hidden xl:items-center xl:flex xl:flex-col xl:flex-1">
          <Video stream={stream} user={user} />

          <Info
            user={user}
            stream={stream}
            channel={channel}
            className="flex gap-4 p-2 w-full"
          />
        </div>
        <Chat
          login={params.slug}
          className="flex-1 xl:flex-initial relative top-0 left-0 w-full h-full  min-h-[34rem] xl:h-[calc(100vh-4rem)] xl:sticky xl:right-0 xl:top-16 xl:w-[340px]"
        />
      </main>
    </div>
  );
}
