"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global error:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                    <div className="mb-6">
                        <Image
                            src="/logo.png"
                            alt="Vera Company"
                            width={80}
                            height={80}
                            className="rounded-lg shadow-sm object-contain mx-auto"
                        />
                    </div>
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
                        Something went wrong!
                    </h2>
                    <p className="mb-8 text-gray-600">
                        A critical error occurred. Please try refreshing the page.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                            onClick={() => reset()}
                        >
                            Try again
                        </button>
                        <button
                            className="rounded bg-gray-200 px-4 py-2 font-bold text-gray-900 hover:bg-gray-300"
                            onClick={() => window.location.href = "/"}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
