import { NextResponse } from "next/server";
import { syncContent } from "@/lib/sync";

export async function POST() {
  try {
    await syncContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
