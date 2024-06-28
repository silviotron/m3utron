import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import Followed from "@/components/followed";
import { ModeToggle } from "@/components/mode-toggle";
import HlsControl from "@/components/hlsControl";

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
  const videoUrl = "https://ztnr.rtve.es/ztnr/1688877.m3u8";

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm gap-2">
          {isSupabaseConnected && <AuthButton />}
          {isSupabaseConnected && <Followed />}
          <ModeToggle />
        </div>
      </nav>

      <main className="w-full max-w-4xl">
        <HlsControl />
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
