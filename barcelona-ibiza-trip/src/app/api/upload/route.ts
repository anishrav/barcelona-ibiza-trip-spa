import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

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

  const filePath = `${randomUUID()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("trip-photos")
    .upload(filePath, file, { contentType: file.type });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Upload failed" },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("trip-photos").getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
