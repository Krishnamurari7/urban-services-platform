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
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

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
