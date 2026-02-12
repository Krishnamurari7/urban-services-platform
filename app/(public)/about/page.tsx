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

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Trust & Safety",
      description:
        "Every professional is verified and background checked for your peace of mind.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Customer First",
      description:
        "Your satisfaction is our top priority. We're here to serve you better every day.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Excellence",
      description:
        "We maintain the highest standards of quality in every service we provide.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Community",
      description:
        "Building connections between professionals and customers in your neighborhood.",
    },
  ];

  const stats = [
    {
      label: "Happy Customers",
      value: "10,000+",
      icon: <Users className="h-6 w-6" />,
    },
    {
      label: "Verified Professionals",
      value: "500+",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      label: "Services Completed",
      value: "50,000+",
      icon: <CheckCircle2 className="h-6 w-6" />,
    },
    {
      label: "Average Rating",
      value: "4.8★",
      icon: <Award className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              About <span className="text-blue-600">Vera Company</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
              We're revolutionizing the way people connect with professional
              services, making it easier, safer, and more convenient than ever
              before.
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
                Vera Company was founded with a simple mission: to connect
                people with trusted professionals who can help them with their
                everyday needs. We recognized that finding reliable service
                providers was often a challenge, filled with uncertainty and
                inconvenience.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Today, we've built a platform that brings together verified
                professionals and customers in a seamless, secure environment.
                Our commitment to quality, safety, and customer satisfaction has
                made us a trusted name in the service industry.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're proud to serve thousands of customers and hundreds of
                professionals, creating opportunities and solving problems every
                single day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-2 border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200 bg-white">
                <CardContent className="pt-6 pb-6">
                  <div className="mb-4 flex justify-center text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
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
              Our Values
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card
                key={index}
                className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-gray-100 bg-white"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center text-blue-600 transition-transform group-hover:scale-110">
                    {value.icon}
                  </div>
                  <h3 className="mb-2 font-bold text-lg text-gray-900">{value.title}</h3>
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
      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <Target className="h-8 w-8 text-primary" />
                    <h3 className="text-2xl font-bold">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To make professional services accessible, reliable, and
                    convenient for everyone, while creating meaningful
                    opportunities for skilled professionals to grow their
                    businesses.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <h3 className="text-2xl font-bold">Our Vision</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the most trusted platform for professional
                    services, recognized for our commitment to quality,
                    innovation, and customer satisfaction across all communities
                    we serve.
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
              Join Us Today
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're looking for services or want to offer them, we'd
              love to have you as part of our community.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
              >
                Get Started
              </a>
              <a
                href="/become-professional"
                className="inline-flex h-12 items-center justify-center rounded-md border-2 border-border bg-background px-8 text-base font-medium transition-all hover:bg-muted"
              >
                Become a Professional
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
