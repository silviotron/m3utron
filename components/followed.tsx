import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const user = (await supabase.auth.getSession()).data.session?.access_token;
  console.log(user);

  return <div>test</div>;
}
