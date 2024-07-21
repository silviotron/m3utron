import { createClient } from "@/utils/supabase/server";
import { ModeToggle } from "@/components/mode-toggle";
import HlsPlayer from "@/components/hlsPlayer";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import Chat from "@/components/chat";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import dayjs from "dayjs";
import { IoPersonOutline } from "react-icons/io5";
import { useTheme } from "next-themes";

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
            <HlsPlayer src={`https://twitch-m3u8-api.vercel.app/p?s=${params.slug}`} />
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
              <div className="flex justify-between">
                <h1 className=" text-xl">{params.slug}</h1>
                <div className="">
                  <Button
                    className="bg-[#9146FF] hover:bg-[#772ce8] h-7"
                    size="sm"
                    variant="outline"
                  >
                    Follow
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <h2>{stream?.title || channel?.title}</h2>
                {stream && (
                  <div className="ml-aoto flex text-nowrap ">
                    <span className="mr-2 text-[#ff8280] flex text-nowrap ">
                      <IoPersonOutline className="h-6 mr-1 " />
                      <span>{stream.viewer_count}</span>
                    </span>
                    <span>
                      {dayjs().diff(dayjs(stream.started_at), "hours")}h{" "}
                      {dayjs().diff(dayjs(stream.started_at), "minutes") % 60}m
                    </span>
                  </div>
                )}
              </div>
              <div className="flex w-full ">
                <a
                  href={`/directory/all/tags/${
                    stream ? stream.game_name.replaceAll(" ", "-") : channel.game_name
                  }`}
                >
                  <span className="text-[#9146FF] whitespace-nowrap hover:underline">
                    {stream?.game_name || channel.game_name}
                  </span>
                </a>
                {stream && (
                  <Carousel
                    opts={{
                      loop: true,
                      dragFree: false,
                      skipSnaps: true,
                    }}
                    className="ml-4 w-full max-w-full overflow-hidden text-nowrap whitespace-nowrap"
                  >
                    <CarouselContent className="select-none ml-0 ">
                      {stream.tags.map((tag: string, index: number) => (
                        <a
                          href={`/directory/category/${tag}`}
                          key={index}
                          className="select-none"
                        >
                          <CarouselItem className="basis-auto  bg-[#53535f] text-[#adadb8] px-2 py-[2px] text-xs font-semibold rounded-full mx-1  hover:opacity-80 max-w-full overflow-hidden text-nowrap whitespace-nowrap">
                            {tag}
                          </CarouselItem>
                        </a>
                      ))}
                    </CarouselContent>
                  </Carousel>
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
