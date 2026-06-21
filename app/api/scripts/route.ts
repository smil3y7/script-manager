import { NextResponse } from "next/server";
import { getRegistry } from "@/lib/registry";

export async function GET() {
  const scripts = await getRegistry();
  return NextResponse.json({ scripts });
}
