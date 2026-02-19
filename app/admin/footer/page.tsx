import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getFooterSettings } from "./actions";
import { FooterForm } from "./footer-form";
import { Card, CardContent } from "@/components/ui/card";

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
}

export default async function AdminFooterPage() {
  await checkAdmin();
  const footerSettings = await getFooterSettings();

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">Footer Settings</h1>
          <p className="text-blue-50 mt-1">Manage footer content and links</p>
        </div>
      </div>

      <FooterForm initialData={footerSettings} />

      {!footerSettings && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> No footer settings found. Default values will be used. 
              Fill out the form above to create footer settings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
