import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, Shield, Eye } from "lucide-react";

export default function CookiesPage() {
  const cookieTypes = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Essential Cookies",
      description: "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.",
      examples: [
        "Authentication cookies",
        "Session management cookies",
        "Security cookies",
      ],
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Functional Cookies",
      description: "These cookies allow the website to remember choices you make and provide enhanced, personalized features.",
      examples: [
        "Language preferences",
        "Region settings",
        "User preferences",
      ],
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: [
        "Page views and navigation",
        "User behavior tracking",
        "Performance metrics",
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
              <Cookie className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Cookie <span className="text-primary">Policy</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Learn about how we use cookies and similar technologies on our platform.
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Policy Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners. Cookies help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">How We Use Cookies</h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                We use cookies for various purposes to enhance your experience on our platform:
              </p>
              <div className="space-y-6">
                {cookieTypes.map((type, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                          {type.icon}
                        </div>
                        <h3 className="text-xl font-semibold">{type.title}</h3>
                      </div>
                      <p className="mb-4 text-muted-foreground leading-relaxed">
                        {type.description}
                      </p>
                      <div className="ml-4">
                        <p className="mb-2 text-sm font-medium">Examples:</p>
                        <ul className="space-y-1">
                          {type.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="list-disc text-sm text-muted-foreground">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Third-Party Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and monitor performance. These third-party cookies are subject to their respective privacy policies.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Managing Cookies</h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. However, this may prevent you from taking full advantage of the website.
                </p>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  To manage cookies in your browser:
                </p>
                <ul className="ml-4 space-y-2">
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    <strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
                  </li>
                  <li className="list-disc text-muted-foreground leading-relaxed">
                    <strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Cookie Duration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies can be either "session" cookies or "persistent" cookies. Session cookies are temporary and are deleted when you close your browser. Persistent cookies remain on your device for a set period or until you delete them. We use both types of cookies to provide you with the best experience.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Updates to This Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please review this page periodically for any updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold">Contact Us</h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  If you have any questions about our use of cookies, please contact us:
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
