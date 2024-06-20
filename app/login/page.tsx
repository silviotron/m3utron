"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { login, signup } from "./actions";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";

export default function page() {
  const handleLoginWithOAuth = (provider: "github" | "google") => {
    const supabase = createClient();
    console.log(location.origin);
    supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: location.origin + "/auth/callback",
      },
    });
  };
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-96 rounded-md border p-5 space-y-5 bg-primary-foreground">
        <div className="flex items-center gap-2">
          <KeyRound />
          <h1 className="text-2xl font-bold">Next + Supabase</h1>
        </div>
        <p className="text-sm darck:text-gray-300">Register/signin Today 👇</p>
        <Button
          className="w-full flex items-center gap-2"
          variant="outline"
          onClick={() => handleLoginWithOAuth("github")}
        >
          <FaGithub />
          Github
        </Button>
        <Button
          className="w-full flex items-center gap-2"
          variant="outline"
          onClick={() => handleLoginWithOAuth("google")}
        >
          <FcGoogle />
          Google
        </Button>
        <Separator orientation="horizontal" />
        <form className="space-y-5" action={login}>
          <Input id="email" name="email" type="email" placeholder="Email" />
          <Input id="password" name="password" type="password" placeholder="Password" />
          <Button className="w-full flex items-center gap-2">Login</Button>
        </form>
        <Button className="w-full flex items-center" variant="link" asChild>
          <Link href={"/"}>Volver</Link>
        </Button>
      </div>
    </div>
  );
}
