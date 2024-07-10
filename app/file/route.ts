import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, res: NextApiResponse) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const url = `https://twitch-m3u8-api.vercel.app/file?a=`;

  const supabase = createClient(); // Crear el cliente de Supabase

  try {
    // Consultar los canales seguidos por el usuario con la ID proporcionada
    const { data, error } = await supabase
      .from("streams")
      .select("streams")
      .eq("user_id", id);

    if (error) {
      throw error;
    }

    if (!(data && data.length > 0)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    console.log(data);
    console.log(JSON.stringify(data));
    return Response.redirect(
      `https://twitch-m3u8-api.vercel.app/file?a=${JSON.stringify(data)}`
    );
  } catch (error) {
    console.error("Error al generar el archivo .m3u:", error);
    return NextResponse.json(
      { error: "Error al generar el archivo .m3u" },
      { status: 500 }
    );
  }
}
