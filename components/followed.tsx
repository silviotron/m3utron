import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/server";

export default function Followed() {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    const fetchStreams = async () => {
      const supabase = createClient();

      const { data } = await supabase.auth.getSession();

      const userId = data.session?.user.user_metadata.provider_id;
      const token = data.session?.provider_token;

      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/streams/followed?user_id=${userId}`,
          {
            method: "GET",
            headers: {
              "Client-ID": `${process.env.TWITCH_CLIENT_ID}`,
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setStreams(data.data);
        }
      } catch (fetchError) {
        console.error("Error fetching streams:", fetchError);
      }
    };

    fetchStreams();
  }, []);

  return (
    <div>
      <h1>Live Streams You Follow</h1>
      <ul>
        {streams.map((stream) => (
          <li key={stream}></li>
        ))}
      </ul>
      <script>console.log({streams})</script>
    </div>
  );
}
