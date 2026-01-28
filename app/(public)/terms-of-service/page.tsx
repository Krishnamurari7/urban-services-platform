import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using our platform, you accept and agree to be bound by these Terms of Service",
        "If you do not agree to these terms, you must not use our services",
        "We reserve the right to modify these terms at any time, and such modifications will be effective immediately",
        "Your continued use of the platform after changes constitutes acceptance of the modified terms",
      ],
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Use of Service",
      content: [
        "You must be at least 18 years old to use our platform",
        "You agree to provide accurate and complete information when creating an account",
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You agree not to use the service for any illegal or unauthorized purpose",
        "You will not interfere with or disrupt the platform or servers",
      ],
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Bookings and Payments",
      content: [
        "All bookings are subject to availability and confirmation",
        "Service prices are set by professionals and may vary",
        "Payment must be made in advance or as specified during booking",
        "Cancellation policies vary by service type and are displayed before booking",
        "Refunds are processed according to our refund policy",
      ],
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "Limitation of Liability",
      content: [
        "We act as a platform connecting customers with service professionals",
        "We are not responsible for the quality of services provided by professionals",
        "We do not guarantee the availability or accuracy of information on the platform",
        "Our liability is limited to the amount you paid for the service",
        "We are not liable for any indirect, incidental, or consequential damages",
      ],
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
            <div className="mb-6 flex justify-center">
              <FileText className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Please read these terms carefully before using our platform and
              services.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service ("Terms") govern your access to and use
                of vera company's platform and services. By using our platform,
                you agree to comply with and be bound by these Terms. If you
                disagree with any part of these terms, you may not access or use
                our services.
              </p>
            </div>

            {sections.map((section, index) => (
              <Card key={index} className="mb-6">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                  </div>
                  <ul className="ml-4 space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="list-disc text-muted-foreground leading-relaxed"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">User Accounts</h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  When you create an account, you agree to:
                </p>
                <ul className="ml-4 space-y-2">
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Provide accurate, current, and complete information
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Maintain and update your information to keep it accurate
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Keep your password secure and confidential
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Accept responsibility for all activities under your account
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  Prohibited Activities
                </h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  You agree not to:
                </p>
                <ul className="ml-4 space-y-2">
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Use the platform for any illegal purpose
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Violate any laws or regulations
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Infringe on intellectual property rights
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Harass, abuse, or harm other users
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Transmit viruses or malicious code
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    Attempt to gain unauthorized access to the platform
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  Intellectual Property
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  All content on the platform, including text, graphics, logos,
                  and software, is the property of vera company or its licensors
                  and is protected by copyright and trademark laws. You may not
                  reproduce, distribute, or create derivative works without our
                  written permission.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to terminate or suspend your account and
                  access to the platform immediately, without prior notice, for
                  conduct that we believe violates these Terms or is harmful to
                  other users, us, or third parties, or for any other reason.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  Dispute Resolution
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Any disputes arising from these Terms or your use of the
                  platform will be resolved through binding arbitration in
                  accordance with applicable laws. You agree to waive any right
                  to a jury trial or to participate in a class action lawsuit.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Changes to Terms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. We
                  will notify users of significant changes via email or through
                  a notice on the platform. Your continued use of the platform
                  after changes constitutes acceptance of the new Terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  Contact Information
                </h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Email: legal@veracompany.com</li>
                  <li>Phone: +91 1800-XXX-XXXX</li>
                  <li>
                    <a href="/contact" className="text-primary hover:underline">
                      Contact Form
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
