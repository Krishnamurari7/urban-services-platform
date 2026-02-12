"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  id: string;
  title?: string | null;
  description?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  link_text?: string | null;
  position: number;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

interface BannersSectionProps {
  banners: Banner[];
}

function BannerSlider({ banners }: BannersSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Pause auto-play when user manually navigates
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full">
      <div className="relative overflow-hidden rounded-lg shadow-2xl">
        {/* Slider Container */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/6] md:aspect-[16/6]">
          {banners.map((banner, index) => {
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {banner.link_url ? (
                  <Link href={banner.link_url} className="block h-full w-full">
                    <div className="relative h-full w-full">
                      {/* Desktop Image - Hidden on mobile */}
                      <Image
                        src={banner.image_url}
                        alt={banner.title || "Banner"}
                        fill
                        className="object-cover hidden md:block"
                        priority={index === 0}
                        sizes="100vw"
                      />
                      {/* Mobile Image - Show if available, otherwise show desktop image */}
                      {banner.mobile_image_url ? (
                        <Image
                          src={banner.mobile_image_url}
                          alt={banner.title || "Banner"}
                          fill
                          className="object-cover block md:hidden"
                          priority={index === 0}
                          sizes="100vw"
                        />
                      ) : (
                        <Image
                          src={banner.image_url}
                          alt={banner.title || "Banner"}
                          fill
                          className="object-cover block md:hidden"
                          priority={index === 0}
                          sizes="100vw"
                        />
                      )}
                      {(banner.title || banner.description) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-4 md:p-8">
                          <div className="text-center text-white px-4">
                            {banner.title && (
                              <h2 className="text-xl font-bold sm:text-2xl md:text-4xl lg:text-5xl mb-2 animate-fade-in">
                                {banner.title}
                              </h2>
                            )}
                            {banner.description && (
                              <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-3 md:mb-4 animate-fade-in">
                                {banner.description}
                              </p>
                            )}
                            {banner.link_text && (
                              <span className="inline-block rounded-full bg-primary px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-semibold text-white hover:bg-primary/90 transition-colors mt-2 md:mt-4 animate-fade-in">
                                {banner.link_text}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="relative h-full w-full">
                    {/* Desktop Image - Hidden on mobile */}
                    <Image
                      src={banner.image_url}
                      alt={banner.title || "Banner"}
                      fill
                      className="object-cover hidden md:block"
                      priority={index === 0}
                      sizes="100vw"
                    />
                    {/* Mobile Image - Show if available, otherwise show desktop image */}
                    {banner.mobile_image_url ? (
                      <Image
                        src={banner.mobile_image_url}
                        alt={banner.title || "Banner"}
                        fill
                        className="object-cover block md:hidden"
                        priority={index === 0}
                        sizes="100vw"
                      />
                    ) : (
                      <Image
                        src={banner.image_url}
                        alt={banner.title || "Banner"}
                        fill
                        className="object-cover block md:hidden"
                        priority={index === 0}
                        sizes="100vw"
                      />
                    )}
                    {(banner.title || banner.description) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-4 md:p-8">
                        <div className="text-center text-white px-4">
                          {banner.title && (
                            <h2 className="text-xl font-bold sm:text-2xl md:text-4xl lg:text-5xl mb-2 animate-fade-in">
                              {banner.title}
                            </h2>
                          )}
                          {banner.description && (
                            <p className="text-sm sm:text-base md:text-xl lg:text-2xl animate-fade-in">
                              {banner.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Navigation Buttons - Hidden on very small screens */}
          {banners.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPrevious}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white/90 text-gray-900 rounded-full p-1.5 md:p-2 shadow-lg hidden sm:flex"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white/90 text-gray-900 rounded-full p-1.5 md:p-2 shadow-lg hidden sm:flex"
                aria-label="Next banner"
              >
                <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
              </Button>
            </>
          )}

          {/* Dot Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-6 md:w-8 h-2 bg-white"
                      : "w-2 h-2 bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { BannerSlider };
export type { Banner, BannersSectionProps };
