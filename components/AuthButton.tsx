import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      {user.email}
      <form action={signOut}>
        <Button className="w-full flex items-center" variant="outline">
          Logout
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <Button className="w-full flex items-center" variant="secondary" asChild>
        <Link href={"/login"}>Login</Link>
      </Button>
    </div>
  );
}
