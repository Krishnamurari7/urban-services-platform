import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CategoriesSection } from "@/components/landing/categories-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <CategoriesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
