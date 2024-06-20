import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center w-full py-2">
      <Button className="" variant="default" asChild>
        <Link href={"/auth"}>Login</Link>
      </Button>
    </div>
  );
}
