"use client";
import { useTheme } from "next-themes";
interface ChatProps {
  login: string;
}

export default function Chat({ login }: ChatProps) {
  const { theme } = useTheme();
  console.log(theme);
  console.log(process.env.APP_URL);

  return (
    <iframe
      src={`https://www.twitch.tv/embed/${login}/chat?${
        theme == "dark" ? "darkpopout" : ""
      }&parent=${
        !process.env.APP_URL?.includes("localhost") ? process.env.APP_URL : "localhost"
      }`}
      width="100%"
      height="100%"
      className="w-[340px] fixed h-[calc(100%-4rem)] right-0 top-16 bottom-0"
    />
  );
}
