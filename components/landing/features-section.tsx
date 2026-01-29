import { Shield, Clock, Star, CheckCircle2 } from "lucide-react";

export function FeaturesSection() {
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
    );
}
