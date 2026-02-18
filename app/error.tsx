"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Check if this is a Next.js redirect error - these should not be shown as errors
    // Next.js redirect() throws a special error that should be handled by the router
    // Redirect errors typically have specific digest patterns or error codes
    const isRedirectError = 
        error.digest?.startsWith("NEXT_REDIRECT") ||
        error.digest?.includes("NEXT_REDIRECT") ||
        error.name === "NEXT_REDIRECT" ||
        (error.message?.includes("NEXT_REDIRECT") && error.digest);

    useEffect(() => {
        if (isRedirectError) {
            // This is a redirect error, let Next.js handle it
            // Silently ignore and let the redirect happen
            return;
        }
        
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error, isRedirectError]);

    // If this is a redirect error, don't render the error UI
    // Let Next.js handle the redirect internally
    if (isRedirectError) {
        return null;
    }

    return (
        <div className="flex min-h-[50vh] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link href="/" className="flex justify-center mb-4">
                        <Image
                            src="/logo.png"
                            alt="Vera Company"
                            width={64}
                            height={64}
                            className="rounded-lg shadow-sm object-contain"
                        />
                    </Link>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Something went wrong!</CardTitle>
                    <CardDescription>
                        We encountered an unexpected error. Our team has been notified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center gap-2">
                    <Button onClick={reset} variant="default">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = "/"} variant="outline">
                        Go Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
