"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  DollarSign,
  Clock,
  Users,
  Shield,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function BecomeProfessionalPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
  });
  const { user } = useAuth();

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Earn More",
      description: "Set your own rates and earn competitive income",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Flexible Schedule",
      description: "Work when you want, choose your own hours",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Build Your Clientele",
      description: "Connect with customers and grow your business",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Badge",
      description: "Get verified and build trust with customers",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Growth Opportunities",
      description: "Access training and grow your skills",
    },
  ];

  const requirements = [
    "Valid government ID proof",
    "Professional experience in your field",
    "Background verification",
    "Bank account for payments",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = `/register?redirect=/become-professional`;
      return;
    }
    // Handle professional registration
    alert("Professional registration form submitted! We'll contact you soon.");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 md:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Join 500+ professionals
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Become a <span className="text-primary">Professional</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Join thousands of professionals earning a great income by
              providing quality services to customers
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Benefits Section */}
          <div>
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold tracking-tight">
                Why Join Us?
              </h2>
              <p className="text-muted-foreground">
                Discover the benefits of partnering with us
              </p>
            </div>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="group transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div>
            <Card className="sticky top-24">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl">Get Started Today</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill out the form and our team will get in touch with you
                  within 24 hours
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your.email@example.com"
                      disabled={!!user}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 9876543210"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium">
                      Years of Experience
                    </label>
                    <Input
                      id="experience"
                      type="number"
                      required
                      min="0"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      placeholder="e.g., 5"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="skills" className="text-sm font-medium">
                      Skills / Services You Offer
                    </label>
                    <Input
                      id="skills"
                      type="text"
                      required
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                      placeholder="e.g., Plumbing, Electrical, Cleaning"
                      className="h-11"
                    />
                  </div>
                  {!user && (
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="font-medium text-primary hover:underline"
                      >
                        Sign up here
                      </Link>
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
                  >
                    Submit Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="mt-6 border-primary/20">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {requirement}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <section className="mt-16 rounded-lg bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-8 md:p-12 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold md:text-3xl">
            Ready to Start Earning?
          </h2>
          <p className="mt-2 text-primary-foreground/90 text-lg">
            Join our platform and start providing services today
          </p>
          <div className="mt-6">
            {!user ? (
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all"
                >
                  Create Account
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                onClick={handleSubmit}
                className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all"
              >
                Apply Now
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
