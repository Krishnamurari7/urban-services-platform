import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/public/category-card";
import {
  Sparkles,
  Wrench,
  Droplet,
  Zap,
  Home as HomeIcon,
  Car,
  Shield,
  Clock,
  Star,
  CheckCircle2,
  Paintbrush,
  Hammer,
  Settings,
  Wind,
  Scissors,
  Flower,
  Bug,
} from "lucide-react";

export default function HomePage() {
  const categories = [
    {
      name: "Cleaning",
      description: "Professional home and office cleaning services",
      href: "/services?category=cleaning",
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      serviceCount: 15,
    },
    {
      name: "Plumbing",
      description: "Expert plumbing solutions for all your needs",
      href: "/services?category=plumbing",
      icon: <Droplet className="h-12 w-12 text-primary" />,
      serviceCount: 12,
    },
    {
      name: "Electrical",
      description: "Safe and reliable electrical services",
      href: "/services?category=electrical",
      icon: <Zap className="h-12 w-12 text-primary" />,
      serviceCount: 10,
    },
    {
      name: "Carpentry",
      description: "Quality carpentry and furniture services",
      href: "/services?category=carpentry",
      icon: <Hammer className="h-12 w-12 text-primary" />,
      serviceCount: 8,
    },
    {
      name: "Home Repair",
      description: "Complete home maintenance and repair",
      href: "/services?category=home-repair",
      icon: <HomeIcon className="h-12 w-12 text-primary" />,
      serviceCount: 20,
    },
    {
      name: "Automotive",
      description: "Car and bike servicing at your doorstep",
      href: "/services?category=automotive",
      icon: <Car className="h-12 w-12 text-primary" />,
      serviceCount: 6,
    },
    {
      name: "Painting",
      description: "Professional painting services for all your needs",
      href: "/services?category=painting",
      icon: <Paintbrush className="h-12 w-12 text-primary" />,
      serviceCount: 4,
    },
    {
      name: "Appliance Repair",
      description: "Professional appliance repair services for all your needs",
      href: "/services?category=appliance-repair",
      icon: <Settings className="h-12 w-12 text-primary" />,
      serviceCount: 4,
    },
    {
      name: "AC Repair",
      description: "Professional AC repair services for all your needs",
      href: "/services?category=ac-repair",
      icon: <Wind className="h-12 w-12 text-primary" />,
      serviceCount: 4,
    },
    {
      name: "Salon",
      description: "Professional salon services for all your needs",
      href: "/services?category=salon",
      icon: <Scissors className="h-12 w-12 text-primary" />,
      serviceCount: 4,
    },
    {
      name: "Gardening",
      description: "Professional gardening services for all your needs",
      href: "/services?category=gardening",
      icon: <Flower className="h-12 w-12 text-primary" />,
      serviceCount: 4,
    },
    {
      name: "Pest Control",
      description: "Professional pest control services for all your needs",
      href: "/services?category=pest-control",
      icon: <Bug className="h-12 w-12 text-primary" />,
      serviceCount: 4,
    },
    {
      name: "Handyman",
      description: "Professional handyman services for all your needs",
      href: "/services?category=handyman",
      icon: <Wrench className="h-12 w-12 text-primary" />,
      serviceCount: 4,
    },
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Professionals",
      description: "All professionals are background verified",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "On-Time Service",
      description: "Guaranteed punctuality or money back",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Quality Assured",
      description: "5-star rated professionals only",
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "100% Satisfaction",
      description: "We ensure complete customer satisfaction",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Trusted by 10,000+ customers</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Professional Services
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                At Your Doorstep
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Connect with verified professionals for all your home and business
              service needs. Book instantly, pay securely, and get quality
              service guaranteed.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/services">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-lg hover:shadow-xl transition-all">
                  Explore Services
                </Button>
              </Link>
              <Link href="/become-professional">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-12 border-2 hover:bg-primary/5 transition-all">
                  Become a Professional
                </Button>
              </Link>
            </div>
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span>4.8+ Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-gradient-to-b from-muted/50 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Why Choose Us?
            </h2>
            <p className="mt-2 text-muted-foreground">
              We're committed to providing the best service experience
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular Service Categories
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose from a wide range of professional services tailored to your needs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 py-16 md:py-24">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90 sm:text-xl">
              Join thousands of satisfied customers who trust us for their
              service needs
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto text-base px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base px-8 h-12 border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
                >
                  Browse Services
                </Button>
              </Link>
            </div>
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-primary-foreground/20 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary-foreground">10K+</div>
                <div className="mt-1 text-sm text-primary-foreground/80">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-foreground">500+</div>
                <div className="mt-1 text-sm text-primary-foreground/80">Verified Professionals</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-foreground">4.8★</div>
                <div className="mt-1 text-sm text-primary-foreground/80">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
