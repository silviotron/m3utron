import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function page() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-96 rounded-md border p-5 space-y-5 bg-primary-foreground">
        <div className="flex items-center gap-2">
          <KeyRound />
          <h1 className="text-2xl font-bold">Next + Supabase</h1>
        </div>
        <p className="text-sm darck:text-gray-300">Register/signin Today 👇</p>
        <Button className="w-full flex items-center gap-2" variant="outline">
          <FaGithub />
          Github
        </Button>
        <Button className="w-full flex items-center gap-2" variant="outline">
          <FcGoogle />
          Google
        </Button>
        <Button className="w-full flex items-center" variant="link" asChild>
          <Link href={"/"}>Volver</Link>
        </Button>
      </div>
    </div>
  );
}
