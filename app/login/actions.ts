"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function handleoAuth(provider: "github" | "google" | "twitch") {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: location.origin + "/auth/callback",
      scopes: provider === "twitch" ? "user:read:follows" : undefined,
    },
  });

  if (error) {
    redirect("/error");
  }
  const session = await supabase.auth.getSession();
  const token = session.data.session?.provider_token;
  const userId = session.data.session?.user.user_metadata.provider_id;
  const clientId = process.env.TWITCH_CLIENT_ID;

  const url = `https://api.twitch.tv/helix/users/follows?from_id=${userId}&first=100`; // Solicitar hasta 100 canales por página

  let followed: any = [];

  let data: any = [];

  let cursor = null;

  do {
    let apiUrl = url;
    if (cursor) {
      apiUrl += `&after=${cursor}`;
    }

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Client-ID": `${clientId}`,
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.data.length > 0) {
      followed.push(...data.data);
    }
  } while (data.pagination && data.pagination.cursor);

  await supabase
    .from("followed")
    .insert({ user_id: session.data.session?.user.id, followed: followed });
  revalidatePath("/", "layout");
  redirect("/");
}
