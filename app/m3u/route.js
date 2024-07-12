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
        return (num / 1000000).toFixed(2) + 'M';
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

    const token = process.env.TWITCH_TOKEN;
    const clientId = process.env.TWITCH_CLIENT_ID;
    const streams = [];
    const SIZE = 100;
    let page = 0;

    while (array.length + 100 > (page + 1) * SIZE) {
      let userLogins = `&user_login=` + array.slice(page * SIZE, page * SIZE + 100).join(`&user_login=`);

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
      datos.data.map(stream => {
        streams.push(stream)
      })
      page++
    }

    streams.sort((a, b) => b.viewer_count - a.viewer_count);

    let fileContent = '#EXTM3U\n';
    const m3us = []

    try {
      // Realiza todas las llamadas a Twitch en paralelo
      const promises = streams.map(async (stream, index) => {
        try {
          const twitchData = await twitch.getStream(stream.user_login, false);
          if (twitchData && twitchData[0]) {
            m3us[index] = `#EXTINF:-1 tvg-name="${stream.user_name}" tvg-logo="${stream.thumbnail_url.replace(/-{width}x{height}/, "")}",🔴${formatNumber(stream.viewer_count)} 🤵${stream.user_name} 🎮${stream.game_name}\n`;
            m3us[index] += `${twitchData[0].url}\n`;
          }
        } catch (err) {
          // No hacer nada si hay un error (probablemente el streamer no está en directo)
        }
      });

      // Espera a que todas las promesas se resuelvan
      await Promise.all(promises);

      fileContent += m3us.join("")

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
