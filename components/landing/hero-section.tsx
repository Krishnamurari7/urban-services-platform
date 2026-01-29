import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Shield, Star } from "lucide-react";

export function HeroSection() {
    return (
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
                        <span className="text-muted-foreground">
                            Trusted by 10,000+ customers
                        </span>
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
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-base px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                            >
                                Explore Services
                            </Button>
                        </Link>
                        <Link href="/become-professional">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-base px-8 h-12 border-2 hover:bg-primary/5 transition-all"
                            >
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
    );
}
