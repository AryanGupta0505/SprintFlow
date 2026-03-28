import { NextResponse } from "next/server";
import { cleanupExpiredP2P } from "../../../lib/p2pCleanUp";

export async function GET() {
  try {
    await cleanupExpiredP2P();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("cleanup error", e);
    return NextResponse.json({ success: false });
  }
}