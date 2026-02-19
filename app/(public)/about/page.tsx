"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Users,
  Target,
  Heart,
  Award,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { usePageContent } from "@/lib/cms/client-page-content";

export default function AboutPage() {
  // Fetch all CMS content
  const { content: heroTitle } = usePageContent(
    "/about",
    "hero_title",
    "About Vera Company"
  );
  const { content: heroDescription } = usePageContent(
    "/about",
    "hero_description",
    "We're revolutionizing the way people connect with professional services, making it easier, safer, and more convenient than ever before."
  );
  const { content: storyParagraph1 } = usePageContent(
    "/about",
    "story_paragraph_1",
    "Vera Company was founded with a simple mission: to connect people with trusted professionals who can help them with their everyday needs. We recognized that finding reliable service providers was often a challenge, filled with uncertainty and inconvenience."
  );
  const { content: storyParagraph2 } = usePageContent(
    "/about",
    "story_paragraph_2",
    "Today, we've built a platform that brings together verified professionals and customers in a seamless, secure environment. Our commitment to quality, safety, and customer satisfaction has made us a trusted name in the service industry."
  );
  const { content: storyParagraph3 } = usePageContent(
    "/about",
    "story_paragraph_3",
    "We're proud to serve thousands of customers and hundreds of professionals, creating opportunities and solving problems every single day."
  );
  const { content: statsCustomers } = usePageContent(
    "/about",
    "stats_customers",
    "10,000+"
  );
  const { content: statsProfessionals } = usePageContent(
    "/about",
    "stats_professionals",
    "500+"
  );
  const { content: statsServices } = usePageContent(
    "/about",
    "stats_services",
    "50,000+"
  );
  const { content: statsRating } = usePageContent(
    "/about",
    "stats_rating",
    "4.8★"
  );
  const { content: valuesTitle } = usePageContent(
    "/about",
    "values_title",
    "Our Values"
  );
  const { content: valuesSubtitle } = usePageContent(
    "/about",
    "values_subtitle",
    "The principles that guide everything we do"
  );
  const { content: value1Title } = usePageContent(
    "/about",
    "value_1_title",
    "Trust & Safety"
  );
  const { content: value1Description } = usePageContent(
    "/about",
    "value_1_description",
    "Every professional is verified and background checked for your peace of mind."
  );
  const { content: value2Title } = usePageContent(
    "/about",
    "value_2_title",
    "Customer First"
  );
  const { content: value2Description } = usePageContent(
    "/about",
    "value_2_description",
    "Your satisfaction is our top priority. We're here to serve you better every day."
  );
  const { content: value3Title } = usePageContent(
    "/about",
    "value_3_title",
    "Excellence"
  );
  const { content: value3Description } = usePageContent(
    "/about",
    "value_3_description",
    "We maintain the highest standards of quality in every service we provide."
  );
  const { content: value4Title } = usePageContent(
    "/about",
    "value_4_title",
    "Community"
  );
  const { content: value4Description } = usePageContent(
    "/about",
    "value_4_description",
    "Building connections between professionals and customers in your neighborhood."
  );
  const { content: missionTitle } = usePageContent(
    "/about",
    "mission_title",
    "Our Mission"
  );
  const { content: missionText } = usePageContent(
    "/about",
    "mission_text",
    "To make professional services accessible, reliable, and convenient for everyone, while creating meaningful opportunities for skilled professionals to grow their businesses."
  );
  const { content: visionTitle } = usePageContent(
    "/about",
    "vision_title",
    "Our Vision"
  );
  const { content: visionText } = usePageContent(
    "/about",
    "vision_text",
    "To become the most trusted platform for professional services, recognized for our commitment to quality, innovation, and customer satisfaction across all communities we serve."
  );
  const { content: ctaTitle } = usePageContent(
    "/about",
    "cta_title",
    "Join Us Today"
  );
  const { content: ctaDescription } = usePageContent(
    "/about",
    "cta_description",
    "Whether you're looking for services or want to offer them, we'd love to have you as part of our community."
  );
  const { content: ctaButton1Text } = usePageContent(
    "/about",
    "cta_button_1_text",
    "Get Started"
  );
  const { content: ctaButton1Link } = usePageContent(
    "/about",
    "cta_button_1_link",
    "/register"
  );
  const { content: ctaButton2Text } = usePageContent(
    "/about",
    "cta_button_2_text",
    "Become a Professional"
  );
  const { content: ctaButton2Link } = usePageContent(
    "/about",
    "cta_button_2_link",
    "/become-professional"
  );

  const values = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: value1Title,
      description: value1Description,
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: value2Title,
      description: value2Description,
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: value3Title,
      description: value3Description,
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: value4Title,
      description: value4Description,
    },
  ];

  const stats = [
    {
      label: "Happy Customers",
      value: statsCustomers,
      icon: <Users className="h-6 w-6" />,
    },
    {
      label: "Verified Professionals",
      value: statsProfessionals,
      icon: <Shield className="h-6 w-6" />,
    },
    {
      label: "Services Completed",
      value: statsServices,
      icon: <CheckCircle2 className="h-6 w-6" />,
    },
    {
      label: "Average Rating",
      value: statsRating,
      icon: <Award className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-purple-400/15 blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              {heroTitle.includes("Vera Company") ? (
                <>
                  About <span className="text-blue-600">Vera Company</span>
                </>
              ) : (
                heroTitle
              )}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl leading-relaxed">
              {heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Our Story
              </h2>
            </div>
            <div className="prose prose-lg mx-auto dark:prose-invert">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {storyParagraph1}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {storyParagraph2}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {storyParagraph3}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 gap-4 md:gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border border-gray-200/60 hover:border-blue-300/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6 pb-6">
                  <div className="mb-4 flex justify-center text-blue-600 transition-transform duration-300 group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {valuesTitle}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {valuesSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card
                key={index}
                className="group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 border border-gray-200/60 hover:border-blue-300/60 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="mb-2 font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{value.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
              <Card className="border border-gray-200/60 hover:border-blue-300/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{missionTitle}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {missionText}
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-gray-200/60 hover:border-purple-300/60 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{visionTitle}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {visionText}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {ctaTitle}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {ctaDescription}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={ctaButton1Link}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8 text-base font-medium text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                {ctaButton1Text}
              </a>
              <a
                href={ctaButton2Link}
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-gray-300 hover:border-primary bg-white px-8 text-base font-medium transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
              >
                {ctaButton2Text}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
