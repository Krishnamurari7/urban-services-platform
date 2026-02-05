import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { BannerForm } from "./banner-form";

async function getBanners() {
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
    const { data: banners, error } = await supabase
      .from("homepage_banners")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
      return [];
    }

    return banners || [];
  } catch (error) {
    console.error("Unexpected error fetching banners:", error);
    return [];
  }
}

export default async function AdminBannersPage() {
  const banners = await getBanners();

  const activeBanners = banners.filter((b) => b.is_active);
  const inactiveBanners = banners.filter((b) => !b.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Homepage Banners CMS
          </h1>
          <p className="text-gray-600 mt-1">Manage homepage banner content</p>
        </div>
        <BannerForm />
      </div>

      {/* Active Banners */}
      {activeBanners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Banners ({activeBanners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBanners.map((banner: any) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-100">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {banner.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        Position: {banner.position}
                      </span>
                      <BannerForm banner={banner} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Banners */}
      {inactiveBanners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Banners ({inactiveBanners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveBanners.map((banner: any) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg overflow-hidden opacity-60"
                >
                  <div className="relative h-48 bg-gray-100">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-gray-500 text-white rounded text-xs">
                        Inactive
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {banner.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        Position: {banner.position}
                      </span>
                      <BannerForm banner={banner} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {banners.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No banners created yet. Create your first banner!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
