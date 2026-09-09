import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("anime")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      database: "connected",
      animeCount: count ?? 0,
    });
  } catch (error) {
    console.error("Supabase health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "disconnected",
      },
      { status: 500 },
    );
  }
}