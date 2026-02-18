import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getPageContentsForAdmin } from "./actions";
import { PageContentTabs } from "./page-content-tabs";

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

export default async function AdminPageContentPage() {
  await checkAdmin();

  // Get all page contents grouped by page
  const { data: allContents } = await getPageContentsForAdmin();

  // Group contents by page_path
  const contentsByPage: Record<string, any[]> = {};
  allContents?.forEach((content: any) => {
    if (!contentsByPage[content.page_path]) {
      contentsByPage[content.page_path] = [];
    }
    contentsByPage[content.page_path].push(content);
  });

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold">Page Content Management</h1>
        <p className="text-sky-100 mt-1">
          Edit all content on public and customer pages
        </p>
      </div>

      <PageContentTabs contentsByPage={contentsByPage} />
    </div>
  );
}
