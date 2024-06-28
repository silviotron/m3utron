import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const s = await supabase.auth.getSession();
  const u = await supabase.auth.getUser();
  console.log(s.data.session?.provider_token);
  console.log(u.data.user?.user_metadata.sub);

  return <div>test</div>;
}
