import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server";

interface Followed {
  followed_at: string;
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_login: string;
}

async function fetchM3U8Url(broadcaster_login: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://twitch-m3u8-api.vercel.app/best?s=${broadcaster_login}`
    );

    if (response.ok) {
      const m3u8Url = await response.text();
      if (!m3u8Url.startsWith("{")) {
        return m3u8Url;
      } else {
        const errorResponse = JSON.parse(m3u8Url);
        if (errorResponse.error !== "streamer is not online") {
          console.error(
            `Error al obtener la URL .m3u8 para ${broadcaster_login}: ${errorResponse.error}`
          );
        }
      }
    } else {
      console.error(
        `Error al obtener la URL .m3u8 para ${broadcaster_login}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(`Error al realizar la solicitud a la API de Twitch: ${error}`);
  }
  return null;
}

export async function GET(request: Request, res: NextApiResponse) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const supabase = createClient(); // Crear el cliente de Supabase

  try {
    // Consultar los canales seguidos por el usuario con la ID proporcionada
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

    // Construir el contenido del archivo .m3u
    let m3uContent = "#EXTM3U\n";

    for (const channel of followedList) {
      const m3u8Url = await fetchM3U8Url(channel.broadcaster_login);
      if (m3u8Url) {
        m3uContent += `#EXTINF:-1, ${channel.broadcaster_name}\n`;
        m3uContent += `${m3u8Url}\n`;
      }
    }

    // Configurar la respuesta HTTP para devolver un archivo .m3u
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${id}.m3u"`);

    // Enviar el contenido del archivo .m3u como respuesta
    res.status(200).send(m3uContent);
  } catch (error) {
    console.error("Error al generar el archivo .m3u:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor al generar el archivo .m3u." });
  }
}
