import { NextResponse } from "next/server";

export async function GET() {
  // Get bookings API logic
  return NextResponse.json({ message: "Bookings endpoint" });
}
