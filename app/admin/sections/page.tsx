import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SectionForm } from "./section-form";

async function getSections() {
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

  try {
    const { data: sections, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching sections:", error);
      return [];
    }

    return sections || [];
  } catch (error) {
    console.error("Unexpected error fetching sections:", error);
    return [];
  }
}

export default async function AdminSectionsPage() {
  const sections = await getSections();

  const activeSections = sections.filter((s: any) => s.is_active);
  const inactiveSections = sections.filter((s: any) => !s.is_active);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <h1 className="text-3xl font-bold">
            Homepage Sections CMS
          </h1>
          <p className="text-indigo-100 mt-1">
            Manage homepage sections content and layout
          </p>
        </div>
        <SectionForm />
      </div>

      {/* Quick Access to Section Editors */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 border-2 border-indigo-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <CardTitle className="text-xl font-bold">Quick Section Editors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/sections/hero">
              <Button variant="outline" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                🏠 Edit Hero Section
              </Button>
            </Link>
            <Link href="/admin/sections/services">
              <Button variant="outline" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                🧹 Edit Services Section
              </Button>
            </Link>
            <Link href="/admin/sections/features">
              <Button variant="outline" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                ✨ Edit Features Section
              </Button>
            </Link>
            <Link href="/admin/sections/cta">
              <Button variant="outline" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                📢 Edit CTA Section
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Sections */}
      {activeSections.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-lg -m-6 mb-4 p-6 text-white">
            <CardTitle className="text-xl font-bold">Active Sections ({activeSections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSections.map((section: any) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-semibold">
                          ✓ Active
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          📄 {section.section_type}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Order: {section.display_order}
                        </span>
                      </div>
                      {section.title && (
                        <h3 className="font-bold text-xl mb-1 text-gray-900">
                          {section.title}
                        </h3>
                      )}
                      {section.subtitle && (
                        <p className="text-sm text-primary font-semibold mb-1">
                          {section.subtitle}
                        </p>
                      )}
                      {section.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          {section.description}
                        </p>
                      )}
                      {section.content && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Content: {JSON.stringify(section.content).substring(0, 100)}
                            ...
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <SectionForm section={section} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Sections */}
      {inactiveSections.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 rounded-t-lg -m-6 mb-4 p-6 text-white">
            <CardTitle className="text-xl font-bold">Inactive Sections ({inactiveSections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveSections.map((section: any) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4 opacity-60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-500 text-white rounded text-xs font-semibold">
                          ⊘ Inactive
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          📄 {section.section_type}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Order: {section.display_order}
                        </span>
                      </div>
                      {section.title && (
                        <h3 className="font-bold text-xl mb-1 text-gray-900">
                          {section.title}
                        </h3>
                      )}
                      {section.subtitle && (
                        <p className="text-sm text-primary font-semibold mb-1">
                          {section.subtitle}
                        </p>
                      )}
                      {section.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <SectionForm section={section} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {sections.length === 0 && (
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 border-2 border-indigo-200 shadow-lg">
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 font-medium">
              No sections created yet. Create your first section!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
