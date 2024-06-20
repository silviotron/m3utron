import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import { ModeToggle } from "@/components/mode-toggle";

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

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-end items-center p-3 text-sm gap-2">
          {isSupabaseConnected && <AuthButton />}
          <ModeToggle />
        </div>
      </nav>

      <main className="flex-1 flex flex-col gap-6 min-h-full">
        <h2 className="font-bold text-4xl mb-4">Contenido</h2>
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
