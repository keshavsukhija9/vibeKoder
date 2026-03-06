import { NextResponse } from "next/server";
import { DEMO_TEMPLATE } from "@/lib/demo-template";

/** Demo template – works without Supabase. */
export async function GET() {
  return NextResponse.json({
    success: true,
    templateJson: DEMO_TEMPLATE,
  });
}
