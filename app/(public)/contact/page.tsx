"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thank you for contacting us! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const contactMethods = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      content: "+91 1800-XXX-XXXX",
      description: "Mon-Fri 9am-6pm IST",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      content: "support@veracompany.com",
      description: "We'll respond within 24 hours",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      content: "123 Business Street",
      description: "City, State 123456",
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
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl leading-relaxed">
              Have a question or need help? We're here to assist you. Reach out
              to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 border border-gray-200/60 hover:border-blue-300/60 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center text-blue-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                      {method.icon}
                    </div>
                  </div>
                  <h3 className="mb-2 font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{method.title}</h3>
                  <p className="mb-1 text-sm font-semibold text-gray-800">{method.content}</p>
                  <p className="text-sm text-gray-600">
                    {method.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mx-auto max-w-2xl">
            <Card className="shadow-xl shadow-blue-500/10 border border-gray-200/60 hover:border-blue-300/60 bg-white/80 backdrop-blur-sm transition-all duration-300">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 9876543210"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="What is this regarding?"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us how we can help..."
                      rows={6}
                      className="flex w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:ring-offset-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 rounded-xl"
                    size="lg"
                  >
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Still Have Questions?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Check out our FAQ section for quick answers to common questions.
            </p>
            <div className="mt-8">
              <a
                href="/faq"
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-gray-300 hover:border-primary bg-white px-8 text-base font-medium transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
              >
                Visit FAQ
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
