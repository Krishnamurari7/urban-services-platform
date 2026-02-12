import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Information We Collect",
      content: [
        "Personal information such as name, email address, phone number, and address when you create an account",
        "Payment information processed securely through our payment partners",
        "Service booking details and preferences",
        "Communication records when you contact our support team",
        "Device information and usage data to improve our services",
      ],
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "How We Use Your Information",
      content: [
        "To provide and improve our services",
        "To process bookings and payments",
        "To communicate with you about your account and bookings",
        "To send you important updates and notifications",
        "To personalize your experience on our platform",
        "To detect and prevent fraud or abuse",
        "To comply with legal obligations",
      ],
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Data Security",
      content: [
        "We use industry-standard encryption to protect your data",
        "All payment information is processed through secure, PCI DSS compliant payment gateways",
        "We regularly update our security measures to protect against threats",
        "Access to your personal information is restricted to authorized personnel only",
        "We never share your payment details with service professionals",
      ],
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Your Rights",
      content: [
        "Access your personal data at any time",
        "Request correction of inaccurate information",
        "Request deletion of your account and data",
        "Opt-out of marketing communications",
        "Request a copy of your data",
        "File a complaint with relevant authorities",
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
              <Shield className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Privacy <span className="text-primary">Policy</span>
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
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vera Company ("we", "our", or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                platform and services. By using our services, you agree to the
                collection and use of information in accordance with this
                policy.
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
                <h3 className="mb-4 text-xl font-semibold">
                  Information Sharing
                </h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share your
                  information only in the following circumstances:
                </p>
                <ul className="ml-4 space-y-2">
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    With service professionals to facilitate bookings (only
                    necessary information)
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    With payment processors to handle transactions
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    When required by law or to protect our rights
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    With your explicit consent
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  Cookies and Tracking
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to improve
                  your experience, analyze usage patterns, and personalize
                  content. You can control cookie preferences through your
                  browser settings. For more information, please see our{" "}
                  <a href="/cookies" className="text-primary hover:underline">
                    Cookie Policy
                  </a>
                  .
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Data Retention</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as necessary
                  to provide our services and fulfill the purposes outlined in
                  this policy. When you delete your account, we will delete or
                  anonymize your personal information, except where we are
                  required to retain it for legal purposes.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">
                  Changes to This Policy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new policy on this
                  page and updating the "Last updated" date. You are advised to
                  review this policy periodically for any changes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Contact Us</h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy or wish to
                  exercise your rights, please contact us:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Email: privacy@veracompany.com</li>
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
