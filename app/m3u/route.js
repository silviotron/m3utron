import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Readable } from 'stream';
import twitch from 'twitch-m3u8';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const ads = searchParams.get("ads") == "false" ? false : true;

  const token = process.env.TWITCH_TOKEN;
  const clientId = process.env.TWITCH_CLIENT_ID;

  const streams = [];

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }



  const supabase = createClient(); // Crear el cliente de Supabase

  try {

    // Consultar los canales seguidos por el usuario con la ID proporcionada
    const { data, error } = await supabase
      .from("followed")
      .select("followed")
      .eq("user_id", id);

    if (error) {
      function attr(name, value) {
        if (value == null || value == "") {
          return "";
        }
        return `&${name}=${value}`;



      }
      const respuestaTop = await fetch(
        `https://api.twitch.tv/helix/streams?first=30${attr("language", searchParams.get("language"))}`,
        {
          method: "GET",
          headers: {
            "Client-ID": `${clientId}`,
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const datos = await respuestaTop.json();
      datos.data.map(stream => {
        streams.push(stream)
      })

    } else {

      if (!(data && data.length > 0)) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }

      const followedList = data[0].followed;



      const array = followedList;
      if (!array) {
        return NextResponse.json({ error: 'El parámetro "a" es requerido.' }, { status: 400 });
      }


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
    }

    let fileContent = '#EXTM3U\n';
    const m3us = []

    try {
      // Realiza todas las llamadas a Twitch en paralelo


      const promises = streams.map(async (stream, index) => {
        try {
          let urlFound = false;

          if (!ads) {
            const endpoints = [
              `https://eu.luminous.dev/live/${stream.user_login}?allow_source=true&allow_audio_only=true&fast_bread=true`,
              `https://eu2.luminous.dev/live/${stream.user_login}?allow_source=true&allow_audio_only=true&fast_bread=true`,
              `https://lb-eu.cdn-perfprod.com/live/${stream.user_login}?allow_source=true&allow_audio_only=true&fast_bread=true`,
              `https://lb-eu2.cdn-perfprod.com/live/${stream.user_login}?allow_source=true&allow_audio_only=true&fast_bread=true`,
              `https://lb-eu3.cdn-perfprod.com/live/${stream.user_login}?allow_source=true&allow_audio_only=true&fast_bread=true`,
              `https://lb-eu4.cdn-perfprod.com/live/${stream.user_login}?allow_source=true&allow_audio_only=true&fast_bread=true`,
              `https://lb-eu5.cdn-perfprod.com/live/${stream.user_login}?allow_source=true&allow_audio_only=true&fast_bread=true`,
            ];

            for (let i = 0; i < endpoints.length && !urlFound; i++) {
              const endpoint = endpoints[i];
              const twitchData = await fetch(endpoint);
              const text = await twitchData.text();
              const lines = text.split('\n');
              const m3u8Lines = lines.filter(line => line.trim().endsWith('.m3u8'));
              const url = m3u8Lines[0];

              if (url && (url.startsWith("https://video-weaver.") && url.endsWith(".m3u8"))) {
                m3us[index] = `#EXTINF:-1 tvg-name="${stream.user_name}" tvg-logo="${stream.thumbnail_url.replace(/-{width}x{height}/, "-256x144")}",🔴${formatNumber(stream.viewer_count)} 😎${stream.user_name} 🎮${stream.game_name}\n`;
                m3us[index] += `${url}\n`;
                urlFound = true;
              }
            }

          }


          if (!urlFound) {
            const twitchData3 = await twitch.getStream(stream.user_login, false);
            if (twitchData3 && twitchData3[0]) {
              m3us[index] = `#EXTINF:-1 tvg-name="${stream.user_name}" tvg-logo="${stream.thumbnail_url.replace(/-{width}x{height}/, "-256x144")}",🔴${formatNumber(stream.viewer_count)} 😎${stream.user_name} 🎮${stream.game_name}\n`;
              m3us[index] += `${twitchData3[0].url}\n`;
            }
          }
        } catch (err) {
          console.error(err)
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
