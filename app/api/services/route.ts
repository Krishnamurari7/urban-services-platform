import { NextResponse } from "next/server";

export async function GET() {
  // Get services API logic
  return NextResponse.json({ message: "Services endpoint" });
}
