import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

async function getBanners() {
  const supabase = await createClient();
  
  try {
    const { data: banners, error } = await supabase
      .from("homepage_banners")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching banners:", error);
      return [];
    }

    // Filter by date range if specified
    const now = new Date();
    const activeBanners = (banners || []).filter((banner) => {
      const startDate = banner.start_date ? new Date(banner.start_date) : null;
      const endDate = banner.end_date ? new Date(banner.end_date) : null;
      
      if (startDate && now < startDate) return false;
      if (endDate && now > endDate) return false;
      
      return true;
    });

    return activeBanners;
  } catch (error) {
    console.error("Unexpected error fetching banners:", error);
    return [];
  }
}

export async function BannersSection() {
  const banners = await getBanners();

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full overflow-hidden rounded-lg shadow-lg"
            >
              {banner.link_url ? (
                <Link href={banner.link_url} className="block">
                  <div className="relative aspect-[16/6] w-full">
                    <Image
                      src={banner.image_url}
                      alt={banner.title || "Banner"}
                      fill
                      className="object-cover"
                      priority={banner.position === 0}
                    />
                    {(banner.title || banner.description) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-8">
                        <div className="text-center text-white">
                          {banner.title && (
                            <h2 className="text-2xl font-bold md:text-4xl mb-2">
                              {banner.title}
                            </h2>
                          )}
                          {banner.description && (
                            <p className="text-lg md:text-xl mb-4">
                              {banner.description}
                            </p>
                          )}
                          {banner.link_text && (
                            <span className="inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                              {banner.link_text}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="relative aspect-[16/6] w-full">
                  <Image
                    src={banner.image_url}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover"
                    priority={banner.position === 0}
                  />
                  {(banner.title || banner.description) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 p-8">
                      <div className="text-center text-white">
                        {banner.title && (
                          <h2 className="text-2xl font-bold md:text-4xl mb-2">
                            {banner.title}
                          </h2>
                        )}
                        {banner.description && (
                          <p className="text-lg md:text-xl">
                            {banner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
