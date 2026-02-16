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
    <section className="relative w-full -mt-4 md:-mt-8">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl ring-1 ring-gray-200/50">
        {/* Slider Container */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/6] md:aspect-[21/7] lg:aspect-[21/8]">
          {banners.map((banner, index) => {
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentIndex 
                    ? "opacity-100 z-10 scale-100" 
                    : "opacity-0 z-0 scale-105"
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
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-black/60 via-black/50 to-black/60 p-4 md:p-8">
                          <div className="text-center text-white px-4 max-w-4xl">
                            {banner.title && (
                              <h2 className="text-2xl font-extrabold sm:text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 drop-shadow-2xl animate-fade-in leading-tight">
                                {banner.title}
                              </h2>
                            )}
                            {banner.description && (
                              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 md:mb-6 animate-fade-in drop-shadow-lg text-gray-100">
                                {banner.description}
                              </p>
                            )}
                            {banner.link_text && (
                              <span className="inline-block rounded-full bg-primary px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-bold text-white hover:bg-primary/90 transition-all duration-300 mt-2 md:mt-4 animate-fade-in shadow-xl hover:scale-105 hover:shadow-2xl">
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
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-black/60 via-black/50 to-black/60 p-4 md:p-8">
                        <div className="text-center text-white px-4 max-w-4xl">
                          {banner.title && (
                            <h2 className="text-2xl font-extrabold sm:text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 drop-shadow-2xl animate-fade-in leading-tight">
                              {banner.title}
                            </h2>
                          )}
                          {banner.description && (
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl animate-fade-in drop-shadow-lg text-gray-100">
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
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 md:p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hidden sm:flex backdrop-blur-sm border border-white/20"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 md:p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hidden sm:flex backdrop-blur-sm border border-white/20"
                aria-label="Next banner"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </>
          )}

          {/* Dot Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 md:gap-2.5 items-center bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 md:w-10 h-2.5 bg-white shadow-lg"
                      : "w-2.5 h-2.5 bg-white/60 hover:bg-white/80"
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
