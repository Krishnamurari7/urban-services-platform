import Link from "next/link";

import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                <span className="text-lg font-bold">V</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">vera company</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted partner for all home and professional services. Connecting you with verified professionals.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@veracompany.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Services</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  All Services
                </Link>
              </li>
              <li>
                <Link href="/services?category=cleaning" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services?category=plumbing" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Plumbing
                </Link>
              </li>
              <li>
                <Link href="/services?category=electrical" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Electrical
                </Link>
              </li>
              <li>
                <Link href="/services?category=carpentry" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Carpentry
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/become-professional" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Become a Professional
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/help-center" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors inline-block hover:translate-x-1">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} vera company. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
