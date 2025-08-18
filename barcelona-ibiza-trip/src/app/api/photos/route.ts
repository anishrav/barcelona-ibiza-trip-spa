import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Service role key not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  );

  const { data: files, error } = await supabase.storage
    .from("trip-photos")
    .list("", { limit: 100 });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const photos =
    files?.map(
      (f) =>
        supabase.storage.from("trip-photos").getPublicUrl(f.name).data
          .publicUrl
    ) ?? [];

  return NextResponse.json({ photos });
}
