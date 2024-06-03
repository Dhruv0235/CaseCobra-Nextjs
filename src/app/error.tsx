"use client";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mt-20 flex h-[60vh] flex-col items-center justify-center p-4 text-center md:p-8">
      <img
        src="/snake-1.png"
        alt="Error Icon"
        className="mb-4 h-40 w-40 md:mb-8 md:h-60 md:w-60"
      />
      <div className="max-w-md">
        <h1 className="mt-2 text-balance text-center text-3xl font-bold !leading-tight tracking-tight text-gray-900 md:text-4xl">
          Oops! Something Went Wrong
        </h1>
        <p className="pt-3 text-lg text-gray-700 md:text-xl">{error.message}</p>
        <div className="pt-4">
          <Button onClick={reset} className="text-center">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
