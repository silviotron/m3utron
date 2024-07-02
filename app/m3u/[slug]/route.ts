import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server";
interface Followed {
  followed_at: string;
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_login: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Invalid request, slug is required" });
  }

  const id = slug;

  const supabase = createClient(); // Create the Supabase client

  try {
    // Query the followed channels for the provided user ID
    const { data, error } = await supabase
      .from("followed")
      .select("followed")
      .eq("user_id", id);

    if (error) {
      throw error;
    }

    if (!(data && data.length > 0)) {
      return res.status(404).json({ error: "Not Found" });
    }

    const followedList: Followed[] = data[0].followed;

    // Build the .m3u file content
    let m3uContent = "#EXTM3U\n";

    for (const channel of followedList) {
      // Get the .m3u8 URL for the channel
      const response = await fetch(
        `https://twitch-m3u8-api.vercel.app/best?s=${channel.broadcaster_login}`
      );

      if (response.ok) {
        const m3u8Url = await response.text();
        if (!m3u8Url.startsWith("{")) {
          // Verify it's not a JSON error
          m3uContent += `#EXTINF:-1, ${channel.broadcaster_name}\n`;
          m3uContent += `${m3u8Url}\n`;
        } else {
          const errorResponse = JSON.parse(m3u8Url);
          if (errorResponse.error !== "streamer is not online") {
            console.error(
              `Error getting .m3u8 URL for ${channel.broadcaster_name}: ${errorResponse.error}`
            );
          }
        }
      } else {
        console.error(
          `Error getting .m3u8 URL for ${channel.broadcaster_name}: ${response.statusText}`
        );
      }
    }

    // Set the response headers to return an .m3u file
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${id}.m3u"`);

    // Send the .m3u file content as the response
    res.status(200).send(m3uContent);
  } catch (error) {
    console.error("Error generating .m3u file:", error);
    res.status(500).json({ error: "Internal server error generating .m3u file." });
  }
}
