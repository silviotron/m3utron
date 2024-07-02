import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Obtener la id de la query params
  const supabase = createClient(); // Crear el cliente de Supabase

  try {
    // Consultar los canales seguidos por el usuario con la ID proporcionada
    const { data, error } = await supabase
      .from("followed")
      .select("followed")
      .eq("user_id", id);

    console.log(data);
    console.log(error);

    if (error) {
      throw error;
    }

    // Construir el contenido del archivo .m3u
    let m3uContent = "#EXTM3U\n";

    for (const channel of data) {
      // Obtener la URL .m3u8 del canal
      const response = await fetch(
        `https://twitch-m3u8-api.vercel.app/?s=${channel.broadcaster_login}`
      );

      if (response.ok) {
        const m3u8Url = await response.text();
        if (!m3u8Url.startsWith("{")) {
          // Verificar si no es un error JSON
          m3uContent += `#EXTINF:-1, ${channel.broadcaster_name}\n`;
          m3uContent += `${m3u8Url}\n`;
        } else {
          const errorResponse = JSON.parse(m3u8Url);
          if (errorResponse.error !== "streamer is not online") {
            console.error(
              `Error al obtener la URL .m3u8 para ${channel.broadcaster_name}: ${errorResponse.error}`
            );
          }
        }
      } else {
        console.error(
          `Error al obtener la URL .m3u8 para ${channel.broadcaster_name}: ${response.statusText}`
        );
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
