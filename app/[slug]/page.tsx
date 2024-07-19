import { createClient } from "@/utils/supabase/server";
import { ModeToggle } from "@/components/mode-toggle";
import HlsPlayer from "@/components/hlsPlayer";
import AuthButton from "@/components/AuthButton";

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
        <div className="w-[90%] float-right  mt-16 pr-[340px]">
          <HlsPlayer src={`https://twitch-m3u8-api.vercel.app/p?s=${params.slug}`} />
          <div className="p-4">
            <h1 className="mb-4 mt-2 text-2xl">{params.slug}</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti possimus,
              dolores similique non amet cupiditate minima molestiae quibusdam accusamus,
              excepturi maiores laborum commodi itaque. Illum id est tempora reprehenderit
              quis?
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti possimus,
              dolores similique non amet cupiditate minima molestiae quibusdam accusamus,
              excepturi maiores laborum commodi itaque. Illum id est tempora reprehenderit
              quis?
            </p>
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
