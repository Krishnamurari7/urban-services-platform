"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  HelpCircle,
  MessageSquare,
  Book,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: <HelpCircle className="h-6 w-6" />,
      title: "Getting Started",
      description: "Learn how to use our platform",
      articles: [
        "How to create an account",
        "How to book a service",
        "How to become a professional",
        "Understanding your dashboard",
      ],
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Bookings & Services",
      description: "Everything about bookings",
      articles: [
        "How to cancel a booking",
        "Rescheduling services",
        "Service pricing explained",
        "Rating and reviews",
      ],
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Payments",
      description: "Payment and billing questions",
      articles: [
        "Payment methods accepted",
        "Refund policy",
        "Payment security",
        "Invoice and receipts",
      ],
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Account & Profile",
      description: "Manage your account",
      articles: [
        "Updating profile information",
        "Changing password",
        "Account verification",
        "Privacy settings",
      ],
    },
  ];

  const popularArticles = [
    {
      title: "How do I book a service?",
      category: "Getting Started",
    },
    {
      title: "What payment methods do you accept?",
      category: "Payments",
    },
    {
      title: "How do I cancel a booking?",
      category: "Bookings & Services",
    },
    {
      title: "How do I become a professional?",
      category: "Getting Started",
    },
    {
      title: "Is my payment information secure?",
      category: "Payments",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Help <span className="text-primary">Center</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Find answers to common questions and get the support you need
            </p>
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10 pr-4 text-base"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular Articles
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Most frequently asked questions
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 md:grid-cols-2">
              {popularArticles.map((article, index) => (
                <Card
                  key={index}
                  className="group transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="mb-2 text-sm font-medium text-primary">
                      {article.category}
                    </div>
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find help organized by topic
            </p>
          </div>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2">
              {categories.map((category, index) => (
                <Card
                  key={index}
                  className="group transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-3 text-primary">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li
                          key={articleIndex}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          → {article}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Still Need Help?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our support team is here to assist you
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/contact">
                <Card className="group transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer w-full sm:w-auto">
                  <CardContent className="p-6 text-center">
                    <Mail className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-sm text-muted-foreground">
                      support@veracompany.com
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/contact">
                <Card className="group transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer w-full sm:w-auto">
                  <CardContent className="p-6 text-center">
                    <Phone className="mx-auto mb-3 h-8 w-8 text-primary" />
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <p className="text-sm text-muted-foreground">
                      +91 1800-XXX-XXXX
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
