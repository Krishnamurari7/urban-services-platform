"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FooterSettings {
  company_name?: string;
  company_description?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  quick_links?: Array<{ name: string; url: string }>;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  cookie_policy_url?: string;
  newsletter_enabled?: boolean;
  newsletter_text?: string;
  copyright_text?: string;
}

interface FooterProps {
  settings: FooterSettings;
}

export function Footer({ settings }: FooterProps) {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribing:", email);
    setEmail("");
  };

  const companyName = settings.company_name || "Vera Company";
  const companyDescription = settings.company_description || "Your one-stop destination for reliable and professional home services. We bring the experts to you.";
  const logoUrl = settings.logo_url || "/logo.png";
  const phone = settings.phone || "+1 (555) 123-4567";
  const emailContact = settings.email || "support@veracompany.com";
  const address = settings.address || "123 Main St, Suite 500, San Francisco, CA 94107";
  const quickLinks = settings.quick_links || [];
  const privacyUrl = settings.privacy_policy_url || "/privacy-policy";
  const termsUrl = settings.terms_of_service_url || "/terms-of-service";
  const cookieUrl = settings.cookie_policy_url || "/cookies";
  const newsletterEnabled = settings.newsletter_enabled ?? true;
  const newsletterText = settings.newsletter_text || "Subscribe for latest updates and offers.";
  const copyrightText = settings.copyright_text || "All rights reserved.";

  return (
    <footer className="relative overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className={`grid grid-cols-1 gap-12 ${newsletterEnabled ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
          {/* Left Column - Company Info */}
          <div className={`space-y-6 ${newsletterEnabled ? 'lg:col-span-1' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Image
                  src={logoUrl}
                  alt={companyName}
                  width={56}
                  height={56}
                  className="relative rounded-2xl shadow-2xl ring-2 ring-white/10 backdrop-blur-sm object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                {companyName}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              {companyDescription}
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#1877F2]/50"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              )}
              {settings.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#1DA1F2]/50"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#0077B5]/50"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              )}
              <a
                href={`mailto:${emailContact}`}
                className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-600/50"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            </div>
          </div>

          {/* Middle Column - Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-6">
              Quick Links
            </h3>
            {quickLinks.length > 0 ? (
              <ul className="space-y-4">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.url}
                      className="group text-sm text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-3"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500/50 group-hover:bg-blue-500 transition-all duration-300 group-hover:scale-125"></span>
                      <span className="group-hover:translate-x-2 transition-transform duration-300 inline-block relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No links available</p>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-6">
              Contact Info
            </h3>
            <div className="space-y-5">
              {phone && (
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-0.5 p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300">
                    <Phone className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <a 
                    href={`tel:${phone.replace(/\s/g, "")}`} 
                    className="text-sm text-gray-400 hover:text-white transition-colors break-words flex-1 pt-1"
                  >
                    {phone}
                  </a>
                </div>
              )}
              {emailContact && (
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-0.5 p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300">
                    <Mail className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <a 
                    href={`mailto:${emailContact}`} 
                    className="text-sm text-gray-400 hover:text-white transition-colors break-words flex-1 pt-1"
                  >
                    {emailContact}
                  </a>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-0.5 p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all duration-300">
                    <MapPin className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <span className="text-sm text-gray-400 break-words flex-1 leading-relaxed pt-1">
                    {address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Newsletter Column */}
          {newsletterEnabled && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-6">
                Newsletter
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {newsletterText}
              </p>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/50 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:via-blue-400 hover:to-purple-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 rounded-xl font-semibold"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} <span className="font-semibold text-white">{companyName}</span>. {copyrightText}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                href={privacyUrl}
                className="text-gray-400 hover:text-white transition-colors duration-300 font-medium relative group"
              >
                Privacy Policy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <span className="text-white/20">•</span>
              <Link
                href={termsUrl}
                className="text-gray-400 hover:text-white transition-colors duration-300 font-medium relative group"
              >
                Terms of Service
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <span className="text-white/20">•</span>
              <Link
                href={cookieUrl}
                className="text-gray-400 hover:text-white transition-colors duration-300 font-medium relative group"
              >
                Cookie Policy
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
