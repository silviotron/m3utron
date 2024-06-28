import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.provider_token;
  const userId = data.session?.user.user_metadata.provider_id;
  const clientId = process.env.TWITCH_CLIENT_ID;

  console.log(userId);

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

  console.log(res);

  return <div>test</div>;
}
