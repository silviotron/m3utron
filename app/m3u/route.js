import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Readable } from 'stream';
import twitch from 'twitch-m3u8';

export async function GET(request) {
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
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const followedList = data[0].followed;

    function formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
      }
      return num.toString();
    }

    const array = followedList;
    if (!array) {
      return NextResponse.json({ error: 'El parámetro "a" es requerido.' }, { status: 400 });
    }

    const session = await supabase.auth.getSession();
    const token = session.data.session?.provider_token;
    const userId = session.data.session?.user.user_metadata.provider_id;
    const clientId = process.env.TWITCH_CLIENT_ID;

    let userLogins = `&user_id=` + array.join(`&user_id=`);
    console.log(`https://api.twitch.tv/helix/streams?first=100${userLogins}`)

    const respuesta = await fetch(
      `https://api.twitch.tv/helix/streams?first=100${userLogins}`,
      {
        method: "GET",
        headers: {
          "Client-ID": `${clientId}`,
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    const datos = await respuesta.json();
    const streams = datos.data;


    streams.sort((a, b) => b.viewer_count - a.viewer_count);

    let fileContent = '#EXTM3U\n';

    try {
      // Realiza todas las llamadas a Twitch en paralelo
      const promises = streams.map(async (stream) => {
        try {
          const twitchData = await twitch.getStream(stream.user_login, false);
          if (twitchData && twitchData[0]) {
            fileContent += `#EXTINF:-1 tvg-name="${stream.user_name}" tvg-logo="${stream.thumbnail_url.replace(/-{width}x{height}/, "")}",🤵${stream.user_name} 🔴${formatNumber(stream.viewer_count)} 🎮${stream.game_name}\n`;
            fileContent += `${twitchData[0].url}\n`;
          }
        } catch (err) {
          // No hacer nada si hay un error (probablemente el streamer no está en directo)
        }
      });

      // Espera a que todas las promesas se resuelvan
      await Promise.all(promises);

      // Crear un stream a partir del contenido del archivo
      const fileStream = new Readable();
      fileStream.push(fileContent);
      fileStream.push(null);

      // Configurar los headers de la respuesta para la descarga del archivo
      const headers = new Headers({
        'Content-Disposition': 'attachment; filename="twitch.m3u"',
        'Content-Type': 'application/octet-stream'
      });

      return new Response(fileStream, { headers });

    } catch (err) {
      console.error('Error procesando los streamers:', err);
      return NextResponse.json({ error: 'Error procesando los streamers' }, { status: 500 });
    }

  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}
