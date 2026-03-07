"use client";

import Image from "next/image";
import { Shield, DollarSign, Headphones, Sparkles } from "lucide-react";
import { usePageContent } from "@/lib/cms/client-page-content";

const DEFAULT_FEATURES_IMAGE =
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80";

const iconMap: Record<string, React.ReactNode> = {
    Shield: <Shield className="h-6 w-6" />,
    DollarSign: <DollarSign className="h-6 w-6" />,
    Headphones: <Headphones className="h-6 w-6" />,
};

const defaultFeatures = [
    {
        icon: "Shield",
        title: "Verified Professionals",
        description: "Background-checked and certified experts with 5+ years of experience.",
        accent: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-600",
        borderHover: "hover:border-blue-200",
    },
    {
        icon: "DollarSign",
        title: "Transparent Pricing",
        description: "No hidden charges. Know what you pay before you book the service.",
        accent: "from-emerald-500 to-emerald-600",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-600",
        borderHover: "hover:border-emerald-200",
    },
    {
        icon: "Headphones",
        title: "24/7 Dedicated Support",
        description: "Need help? Our customer success team is available around the clock.",
        accent: "from-amber-500 to-orange-500",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-600",
        borderHover: "hover:border-amber-200",
    },
];

export function FeaturesSection() {
    const { content: featuresTitle } = usePageContent(
        "/",
        "features_title",
        "Why Homeowners Trust Us"
    );
    const { content: featuresDescription } = usePageContent(
        "/",
        "features_description",
        "We've simplified home maintenance so you can focus on what matters. Every expert on our platform undergoes a rigorous vetting process."
    );
    const { content: featuresImageUrl } = usePageContent(
        "/",
        "features_image_url",
        DEFAULT_FEATURES_IMAGE
    );

    const features = defaultFeatures;

    return (
        <section className="relative py-20 md:py-28 overflow-hidden">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-white" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
                    {/* Left – Visual block with background image */}
                    <div className="relative order-2 lg:order-1">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-200/30 aspect-[4/3] max-h-[420px]">
                            <Image
                                src={featuresImageUrl || DEFAULT_FEATURES_IMAGE}
                                alt="Home services - trusted professionals"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority={false}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_80%,rgba(59,130,246,0.15),transparent_60%)]" />
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                                    {[
                                        { Icon: Shield, label: "Verified", color: "bg-blue-500/15 text-blue-600 border-blue-200/60" },
                                        { Icon: DollarSign, label: "Fair price", color: "bg-emerald-500/15 text-emerald-600 border-emerald-200/60" },
                                        { Icon: Headphones, label: "Support", color: "bg-amber-500/15 text-amber-600 border-amber-200/60" },
                                        { Icon: Sparkles, label: "Quality", color: "bg-violet-500/15 text-violet-600 border-violet-200/60" },
                                    ].map(({ Icon, label, color }, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-3 rounded-xl border bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm ${color} transition-transform duration-200 hover:scale-[1.02]`}
                                        >
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right – Content */}
                    <div className="order-1 lg:order-2">
                        <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
                            Why choose us
                        </p>
                        <h2 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-slate-900 tracking-tight mb-4">
                            {featuresTitle}
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl">
                            {featuresDescription}
                        </p>
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`group flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white/60 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-md hover:bg-white/80 ${feature.borderHover}`}
                                >
                                    <div
                                        className={`flex-shrink-0 w-12 h-12 rounded-xl ${feature.iconBg} ${feature.iconColor} flex items-center justify-center ring-1 ring-slate-200/50 group-hover:ring-slate-300/60 transition-shadow`}
                                    >
                                        {iconMap[feature.icon] || <Shield className="h-6 w-6" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-slate-900 mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
