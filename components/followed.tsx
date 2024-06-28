import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const user = await supabase.auth.getUser();
  console.log(user);

  return <div>test</div>;
}
