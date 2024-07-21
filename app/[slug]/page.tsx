import { createClient } from "@/utils/supabase/server";
import { ModeToggle } from "@/components/mode-toggle";
import HlsPlayer from "@/components/hlsPlayer";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import Timer from "@/components/timer";
import Chat from "@/components/chat";
import Tags from "@/components/tags";
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
  //console.log(stream);
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

      <main className="flex flex-col  w-full  min-h-screen md:flex-none md:inline">
        <div className="w-full xl:w-[88%] md:float-right  mt-16 md:pr-[340px] md:overflow-hidden">
          {stream ? (
            <HlsPlayer src={`https://twitch-m3u8-api.vercel.app/p?s=${user.login}`} />
          ) : (
            <div className="relative">
              {user.offline_image_url != "" ? (
                <img src={user.offline_image_url} alt="s" className="w-full h-auto" />
              ) : (
                <div className="w-full bg-black aspect-video" />
              )}
              <span className="absolute top-4 right-6 bg-black bg-opacity-75 text-white px-1 py-0 text-sm">
                OFFLINE
              </span>
            </div>
          )}
          <div className=" flex gap-4 mt-2">
            <img
              src={user.profile_image_url}
              alt=""
              className="rounded-full size-20 my-auto   border-4 border-[#9146FF] p-1"
            />
            <div className="w-full overflow-hidden">
              <div className="flex flex-wrap justify-between md:flex-nowrap">
                <h1 className="text-xl flex">
                  {user.display_name}
                  {user.broadcaster_type == "partner" && (
                    <RiVerifiedBadgeFill
                      color="#9146FF"
                      className="h-full ml-1 "
                      size={15}
                    />
                  )}
                </h1>
                <div className="flex items-center space-x-2">
                  {stream && (
                    <>
                      <span className="text-[#ff8280] flex items-center space-x-1">
                        <IoPersonOutline className="h-6" />
                        <span>{stream.viewer_count}</span>
                      </span>
                      <Timer start={stream.started_at} />
                    </>
                  )}
                  <Button
                    className="bg-[#9146FF] hover:bg-[#772ce8] h-7"
                    size="sm"
                    variant="outline"
                  >
                    <FaRegHeart className="mr-1" />
                    Follow
                  </Button>
                </div>
              </div>

              <div className="mt-1 ">
                <h2>{stream?.title || channel?.title}</h2>
              </div>

              <div className="mt-1 flex w-full flex-wrap md:flex-nowrap ">
                <a
                  href={`/directory/all/tags/${
                    stream ? stream.game_name.replaceAll(" ", "-") : channel.game_name
                  }`}
                  className="text-[#9146FF] whitespace-nowrap hover:underline mb-2 mr-4 "
                >
                  {stream?.game_name || channel.game_name}
                </a>
                {stream && stream.tags.length > 0 && (
                  <div className="w-full mb-2">
                    <Tags tags={stream.tags} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Chat
          login={params.slug}
          className="flex-1 relative top-0 left-0 w-full h-full  min-h-96  md:w-[340px] md:fixed md:h-[calc(100%-4rem)] md:right-0 md:top-16 md:bottom-0 md:left-auto"
        />
      </main>
    </div>
  );
}
