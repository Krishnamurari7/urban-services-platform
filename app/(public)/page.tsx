import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CategoriesSection } from "@/components/landing/categories-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { StatsSection } from "@/components/landing/stats-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PartnersSection } from "@/components/landing/partners-section";
import { CTASection } from "@/components/landing/cta-section";
import { BannerSlider } from "@/components/landing/banners-section";
import { createClient } from "@/lib/supabase/server";

async function getHomepageSections() {
  const supabase = await createClient();
  
  try {
    const { data: sections, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("is_active", true)
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

export default async function HomePage() {
  const sections = await getHomepageSections();
  const banners = await getBanners();

  // Map section types to components
  const sectionComponents: Record<string, React.ReactNode> = {};

  sections.forEach((section: any) => {
    const props = {
      title: section.title,
      subtitle: section.subtitle,
      description: section.description,
    };

    switch (section.section_type) {
      case "testimonials":
        sectionComponents[section.display_order] = (
          <TestimonialsSection
            key={section.id}
            {...props}
            testimonials={section.content?.testimonials}
          />
        );
        break;
      case "stats":
        sectionComponents[section.display_order] = (
          <StatsSection
            key={section.id}
            {...props}
            stats={section.content?.stats}
          />
        );
        break;
      case "how_it_works":
        sectionComponents[section.display_order] = (
          <HowItWorksSection
            key={section.id}
            {...props}
            steps={section.content?.steps}
          />
        );
        break;
      case "partners":
        sectionComponents[section.display_order] = (
          <PartnersSection
            key={section.id}
            {...props}
            partners={section.content?.partners}
          />
        );
        break;
    }
  });

  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      {banners && banners.length > 0 && (
        <section className="w-full">
          <div className="container mx-auto px-4 py-6">
            <BannerSlider banners={banners} />
          </div>
        </section>
      )}
      <FeaturesSection />
      <CategoriesSection />
      
      {/* Render dynamic sections in order */}
      {Object.keys(sectionComponents)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => sectionComponents[key])}
      
      <CTASection />
    </div>
  );
}
