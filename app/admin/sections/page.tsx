import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Homepage Sections CMS
          </h1>
          <p className="text-gray-600 mt-1">
            Manage homepage sections content and layout
          </p>
        </div>
        <SectionForm />
      </div>

      {/* Active Sections */}
      {activeSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Sections ({activeSections.length})</CardTitle>
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
                        <span className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                          Active
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {section.section_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Order: {section.display_order}
                        </span>
                      </div>
                      {section.title && (
                        <h3 className="font-semibold text-lg mb-1">
                          {section.title}
                        </h3>
                      )}
                      {section.subtitle && (
                        <p className="text-sm text-primary font-medium mb-1">
                          {section.subtitle}
                        </p>
                      )}
                      {section.description && (
                        <p className="text-sm text-gray-600 mb-2">
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
                    <SectionForm section={section} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Sections */}
      {inactiveSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Sections ({inactiveSections.length})</CardTitle>
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
                        <span className="px-2 py-1 bg-gray-500 text-white rounded text-xs">
                          Inactive
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {section.section_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Order: {section.display_order}
                        </span>
                      </div>
                      {section.title && (
                        <h3 className="font-semibold text-lg mb-1">
                          {section.title}
                        </h3>
                      )}
                      {section.subtitle && (
                        <p className="text-sm text-primary font-medium mb-1">
                          {section.subtitle}
                        </p>
                      )}
                      {section.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <SectionForm section={section} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {sections.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No sections created yet. Create your first section!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
