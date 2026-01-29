"use client";

import { useEffect } from "react";

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
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">
                        Something went wrong!
                    </h2>
                    <p className="mb-8 text-gray-600">
                        A critical error occurred. Please try refreshing the page.
                    </p>
                    <button
                        className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                        onClick={() => reset()}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
