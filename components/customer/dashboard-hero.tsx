"use client";

import { CheckCircle2 } from "lucide-react";
import { usePageContent } from "@/lib/cms/client-page-content";

interface CustomerDashboardHeroProps {
  profileName: string;
}

export function CustomerDashboardHero({ profileName }: CustomerDashboardHeroProps) {
  const { content: welcomeMessage } = usePageContent(
    "/customer/dashboard",
    "welcome_message",
    `Welcome back, ${profileName}!`
  );

  const { content: heroTitle } = usePageContent(
    "/customer/dashboard",
    "hero_title",
    "Your services, all in one place."
  );

  const { content: heroDescription } = usePageContent(
    "/customer/dashboard",
    "hero_description",
    "Manage your bookings, track your services, and discover new professional help."
  );

  // Parse hero title to extract the highlighted part
  const titleParts = heroTitle.split("all in one place");
  const beforeHighlight = titleParts[0] || "Your services,";
  const afterHighlight = titleParts[1] || "";

  return (
    <>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full text-sm font-medium text-purple-700 mb-4">
        <CheckCircle2 className="h-4 w-4" />
        <span>{welcomeMessage}</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
        <span className="text-gray-900">{beforeHighlight}</span>{" "}
        <span className="text-purple-600">all in one place</span>
        {afterHighlight && <span className="text-gray-900">{afterHighlight}</span>}
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 max-w-lg">
        {heroDescription}
      </p>
    </>
  );
}
