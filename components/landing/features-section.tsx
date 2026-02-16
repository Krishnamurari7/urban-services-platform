"use client";

import { useState, useEffect } from "react";
import { Shield, DollarSign, Headphones } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    {
        icon: "DollarSign",
        title: "Transparent Pricing",
        description: "No hidden charges. Know what you pay before you book the service.",
        color: "text-green-600",
        bgColor: "bg-green-100",
    },
    {
        icon: "Headphones",
        title: "24/7 Dedicated Support",
        description: "Need help? Our customer success team is available around the clock.",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
    },
];

export function FeaturesSection() {
    const [sectionData, setSectionData] = useState({
        title: "Why Homeowners Trust Us",
        description: "We've simplified home maintenance so you can focus on what matters. Every expert on our platform undergoes a rigorous vetting process.",
        features: defaultFeatures,
    });

    useEffect(() => {
        const fetchFeaturesData = async () => {
            try {
                const supabase = createClient();
                const { data: sectionData } = await supabase
                    .from("homepage_sections")
                    .select("*")
                    .eq("section_type", "features")
                    .eq("is_active", true)
                    .single();

                if (sectionData?.content) {
                    setSectionData({
                        title: sectionData.content.title || sectionData.title || "Why Homeowners Trust Us",
                        description: sectionData.content.description || sectionData.description || "",
                        features: sectionData.content.features || defaultFeatures,
                    });
                }
            } catch (error) {
                console.error("Error fetching features data:", error);
            }
        };
        fetchFeaturesData();
    }, []);

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Images */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="rounded-xl overflow-hidden bg-green-100 aspect-square">
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Cleaning Supplies</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-green-700 aspect-square">
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Shield className="h-16 w-16 text-white mx-auto mb-4" />
                                    <p className="text-white">Tools & Equipment</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-right">
                            {sectionData.title}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 text-right">
                            {sectionData.description}
                        </p>
                        <div className="space-y-6">
                            {sectionData.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4"
                                >
                                    <div className={`${feature.bgColor} ${feature.color} p-3 rounded-lg flex-shrink-0`}>
                                        {iconMap[feature.icon] || <Shield className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600">
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
