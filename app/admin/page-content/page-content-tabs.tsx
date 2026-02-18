"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContentForm } from "./page-content-form";
import { HomePageEditor } from "./home-page-editor";
import { CustomerDashboardEditor } from "./customer-dashboard-editor";

// Main pages (shown as tabs)
const MAIN_PAGES = [
  { path: "/", name: "Homepage (Public)" },
  { path: "/customer/dashboard", name: "Customer Dashboard" },
  { path: "/customer/book-service", name: "Book Service Page" },
  { path: "/about", name: "About Page" },
];

// Sub-pages (shown as links below tabs, grouped by main page)
const SUB_PAGES: Record<string, Array<{ path: string; name: string }>> = {
  "/": [
    { path: "/contact", name: "Contact Page" },
    { path: "/faq", name: "FAQ Page" },
    { path: "/help-center", name: "Help Center" },
    { path: "/become-professional", name: "Become Professional" },
  ],
};

// All pages combined for easy access
const ALL_PAGES = [
  ...MAIN_PAGES,
  ...Object.values(SUB_PAGES).flat(),
];

interface PageContentTabsProps {
  contentsByPage: Record<string, any[]>;
}

export function PageContentTabs({ contentsByPage }: PageContentTabsProps) {
  const [activeTab, setActiveTab] = useState(MAIN_PAGES[0].path);
  
  // Find which main page the active tab belongs to
  const getMainPageForPath = (path: string) => {
    // Check if it's a main page
    if (MAIN_PAGES.some((p) => p.path === path)) {
      return path;
    }
    // Check if it's a sub-page
    for (const [mainPath, subPages] of Object.entries(SUB_PAGES)) {
      if (subPages.some((sp) => sp.path === path)) {
        return mainPath;
      }
    }
    return MAIN_PAGES[0].path;
  };

  const activeMainPagePath = getMainPageForPath(activeTab);
  const activeMainPage = MAIN_PAGES.find((p) => p.path === activeMainPagePath) || MAIN_PAGES[0];
  const subPages = SUB_PAGES[activeMainPagePath] || [];

  return (
    <div className="w-full">
      {/* Main tabs row */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {MAIN_PAGES.map((page) => {
          const isActive = activeMainPagePath === page.path;
          return (
            <button
              key={page.path}
              onClick={() => setActiveTab(page.path)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {page.name}
            </button>
          );
        })}
      </div>

      {/* Sub-pages links row (shown for the active main page) */}
      {subPages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {subPages.map((subPage) => {
            const isActive = activeTab === subPage.path;
            return (
              <button
                key={subPage.path}
                onClick={() => setActiveTab(subPage.path)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {subPage.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Content for all pages (main + sub) */}
      {ALL_PAGES.map((page) => (
        <div
          key={page.path}
          className={activeTab === page.path ? "block" : "hidden"}
        >
          {/* Use special editors for home page and customer dashboard */}
          {page.path === "/" && (
            <HomePageEditor initialContents={contentsByPage[page.path] || []} />
          )}
          
          {page.path === "/customer/dashboard" && (
            <CustomerDashboardEditor initialContents={contentsByPage[page.path] || []} />
          )}

          {/* Use standard form for other pages */}
          {page.path !== "/" && page.path !== "/customer/dashboard" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{page.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Page Path: {page.path}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <PageContentForm pagePath={page.path} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contentsByPage[page.path] && contentsByPage[page.path].length > 0 ? (
                  <div className="space-y-4">
                    {contentsByPage[page.path].map((content: any) => (
                      <div
                        key={content.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {content.content_key}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                {content.content_type}
                              </span>
                              {content.is_active ? (
                                <span className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-500 text-white rounded text-xs">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {content.content_value && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">Content:</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded break-words">
                                  {content.content_value.length > 200
                                    ? content.content_value.substring(0, 200) + "..."
                                    : content.content_value}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <PageContentForm content={content} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No content configured for this page yet.</p>
                    <p className="text-sm mb-4">Click the "Add Content" button above to start editing.</p>
                    <div className="flex justify-center">
                      <PageContentForm pagePath={page.path} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}
