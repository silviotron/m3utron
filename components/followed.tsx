import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.provider_token;
  const userId = data.session?.user.user_metadata;
  const clientId = "";

  console.log(userId);

  return <div>test</div>;
}
