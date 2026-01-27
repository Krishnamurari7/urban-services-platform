import { NextResponse } from "next/server";

export async function GET() {
  // Get users API logic
  return NextResponse.json({ message: "Users endpoint" });
}
