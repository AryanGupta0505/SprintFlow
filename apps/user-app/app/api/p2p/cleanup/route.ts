import { NextResponse } from "next/server";
import { cleanupExpiredP2P } from "../../../lib/p2pCleanUp";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await cleanupExpiredP2P();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("❌ CLEANUP ERROR:", e); // 🔥 ADD THIS
    return NextResponse.json({
      success: false,
      error: e.message
    });
  }
}