"use client";

import { usePageContent } from "@/lib/cms/client-page-content";

interface CustomerDashboardSectionTitleProps {
  titleKey: string;
  descriptionKey: string;
  defaultTitle: string;
  defaultDescription: string;
}

export function CustomerDashboardSectionTitle({
  titleKey,
  descriptionKey,
  defaultTitle,
  defaultDescription,
}: CustomerDashboardSectionTitleProps) {
  const { content: title } = usePageContent(
    "/customer/dashboard",
    titleKey,
    defaultTitle
  );

  const { content: description } = usePageContent(
    "/customer/dashboard",
    descriptionKey,
    defaultDescription
  );

  return (
    <>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      <p className="text-gray-600">
        {description}
      </p>
    </>
  );
}
