import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
    return (
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
                            <div className="text-3xl font-bold text-primary-foreground">
                                10K+
                            </div>
                            <div className="mt-1 text-sm text-primary-foreground/80">
                                Happy Customers
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-foreground">
                                500+
                            </div>
                            <div className="mt-1 text-sm text-primary-foreground/80">
                                Verified Professionals
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-primary-foreground">
                                4.8★
                            </div>
                            <div className="mt-1 text-sm text-primary-foreground/80">
                                Average Rating
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
