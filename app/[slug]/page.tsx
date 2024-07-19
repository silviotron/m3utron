import { createClient } from "@/utils/supabase/server";
import { ModeToggle } from "@/components/mode-toggle";
import HlsPlayer from "@/components/hlsPlayer";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import dayjs from "dayjs";
import { FaCircle } from "react-icons/fa";

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

  console.log(user);
  console.log(stream);

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

      <main className="w-full max-h-full">
        <div className="w-[88%] float-right  mt-16 pr-[340px]">
          <HlsPlayer src={`https://twitch-m3u8-api.vercel.app/p?s=${params.slug}`} />
          <div className=" flex gap-4 mt-2">
            <img
              src={user.profile_image_url}
              alt=""
              className="rounded-full size-20 my-auto   border-4 border-[#9146FF] p-1"
            />
            <div className="w-full">
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
              <div className="flex">
                <h2>{stream.title}</h2>
                <div className="ml-auto">
                  <span className="mr-2">
                    <span className="animate-pulse">🔴</span>
                    {stream.viewer_count}
                  </span>
                  <span>
                    {dayjs().diff(dayjs(stream.started_at), "hours")}h{" "}
                    {dayjs().diff(dayjs(stream.started_at), "minutes") % 60}m
                  </span>
                </div>
              </div>
              <div className="flex ">
                <a href={`/directory/all/tags/${stream.game_name.replaceAll(" ", "-")}`}>
                  <span className="text-[#9146FF] whitespace-nowrap hover:underline">
                    {stream.game_name}
                  </span>
                </a>
                <Carousel
                  opts={{
                    loop: true,
                    dragFree: false,
                    skipSnaps: true,
                    active: false,
                  }}
                  className="ml-4"
                >
                  <CarouselContent className="select-none ml-0">
                    {stream.tags.map((tag: string, index: number) => (
                      <a
                        href={`/directory/category/${tag}`}
                        key={index}
                        className="select-none"
                      >
                        <CarouselItem
                          key={index}
                          className="basis-auto  bg-[#53535f] text-[#adadb8] px-2 py-[2px] text-xs font-semibold rounded-full mx-1  hover:opacity-80 max-w-full overflow-hidden"
                        >
                          {tag}
                        </CarouselItem>
                      </a>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
        <iframe
          src={`https://www.twitch.tv/popout/${params.slug}/chat`}
          width="100%"
          height="100%"
          className="w-[340px] fixed h-[calc(100%-4rem)] right-0 top-16 bottom-0"
        />
      </main>
    </div>
  );
}
