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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 py-16 md:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-purple-400/15 blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-gray-200/60 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm shadow-sm">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              <span className="text-gray-600">
                Join 500+ professionals
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              Become a <span className="text-primary">Professional</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl leading-relaxed">
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
                  className="group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 border border-gray-200/60 hover:border-blue-300/60 bg-white/80 backdrop-blur-sm"
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="rounded-xl bg-blue-50 p-3 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-100">
                      {benefit.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">
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
            <Card className="sticky top-24 border border-gray-200/60 hover:border-blue-300/60 bg-white/80 backdrop-blur-sm shadow-xl shadow-blue-500/10 transition-all duration-300">
              <CardHeader className="border-b border-gray-200/60">
                <CardTitle className="text-2xl text-gray-900">Get Started Today</CardTitle>
                <p className="mt-2 text-sm text-gray-600">
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
                    className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
                  >
                    Submit Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="mt-6 border border-blue-200/60 hover:border-blue-300/60 bg-white/80 backdrop-blur-sm transition-all duration-300">
              <CardHeader className="border-b border-gray-200/60">
                <CardTitle className="text-lg text-gray-900">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-gray-600">
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
        <section className="mt-16 rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-8 md:p-12 text-center text-white shadow-xl shadow-primary/30">
          <h2 className="text-2xl font-bold md:text-3xl">
            Ready to Start Earning?
          </h2>
          <p className="mt-2 text-white/90 text-lg">
            Join our platform and start providing services today
          </p>
          <div className="mt-6">
            {!user ? (
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 text-base bg-white text-primary shadow-lg hover:shadow-xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
                >
                  Create Account
                </Button>
              </Link>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                onClick={handleSubmit}
                className="h-12 px-8 text-base bg-white text-primary shadow-lg hover:shadow-xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
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
