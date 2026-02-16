"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function HeroSection() {
    const router = useRouter();
    const [serviceQuery, setServiceQuery] = useState("");
    const [location, setLocation] = useState("");
    const [heroData, setHeroData] = useState({
        title: "Professional Home Services at Your Doorstep",
        subtitle: "Home Services",
        description: "Book verified experts for home cleaning, sanitization, and maintenance. Reliable, affordable, and just a click away.",
        trustText: "Trusted by 10,000+ households",
        certificationText: "CERTIFIED EXPERTS",
        certificationSubtext: "100% Background Checked",
        imageUrl: "",
    });

    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const supabase = createClient();
                const { data: sectionData } = await supabase
                    .from("homepage_sections")
                    .select("*")
                    .eq("section_type", "hero")
                    .eq("is_active", true)
                    .single();

                if (sectionData?.content) {
                    setHeroData({
                        title: sectionData.content.title || heroData.title,
                        subtitle: sectionData.content.subtitle || heroData.subtitle,
                        description: sectionData.content.description || heroData.description,
                        trustText: sectionData.content.trustText || heroData.trustText,
                        certificationText: sectionData.content.certificationText || heroData.certificationText,
                        certificationSubtext: sectionData.content.certificationSubtext || heroData.certificationSubtext,
                        imageUrl: sectionData.content.imageUrl || sectionData.image_url || heroData.imageUrl,
                    });
                }
            } catch (error) {
                console.error("Error fetching hero data:", error);
            }
        };
        fetchHeroData();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (serviceQuery) params.set("search", serviceQuery);
        if (location) params.set("location", location);
        router.push(`/services?${params.toString()}`);
    };

    return (
        <section className="relative overflow-hidden bg-white py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            {heroData.title.split(heroData.subtitle)[0]}
                            <span className="text-blue-600">{heroData.subtitle}</span>
                            {heroData.title.split(heroData.subtitle)[1] || " at Your Doorstep"}
                        </h1>
                        
                        <p className="text-lg text-gray-600 mb-8">
                            {heroData.description}
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex flex-col sm:flex-row gap-2 mb-6">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Your Location"
                                    className="pl-10 h-12 text-base border-0 focus-visible:ring-0"
                                />
                            </div>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    value={serviceQuery}
                                    onChange={(e) => setServiceQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Search for deep clean"
                                    className="pl-10 h-12 text-base border-0 focus-visible:ring-0"
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Search
                            </Button>
                        </div>

                        {/* Trust Indicator */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{heroData.trustText}</span>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden bg-blue-100 aspect-[4/5]">
                            {heroData.imageUrl ? (
                                <Image
                                    src={heroData.imageUrl}
                                    alt="Professional Service"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                                            <Users className="h-16 w-16 text-blue-600" />
                                        </div>
                                        <p className="text-gray-600">Professional Service Image</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Certification Badge */}
                        <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">{heroData.certificationText}</p>
                                    <p className="text-xs text-gray-600">{heroData.certificationSubtext}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
