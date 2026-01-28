import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Check if service has active bookings
  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("service_id", id)
    .in("status", ["pending", "confirmed", "in_progress"])
    .limit(1);

  if (activeBookings && activeBookings.length > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot delete service with active bookings. Please cancel bookings first.",
      },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "service_deleted",
    target_type: "service",
    target_id: id,
    description: `Deleted service: ${id}`,
  });

  return NextResponse.json({ success: true });
}
