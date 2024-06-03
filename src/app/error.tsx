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
    <div className="flex flex-col justify-center items-center h-[60vh] p-4 md:p-8 text-center mt-20">
      <img
        src="/snake-1.png"
        alt="Error Icon"
        className="h-40 w-40 md:h-60 md:w-60 mb-4 md:mb-8"
      />
      <div className="max-w-md">
        <h1 className="mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-3xl md:text-4xl text-gray-900">
          Oops! Something Went Wrong
        </h1>
        <p className="pt-3 text-gray-700 text-lg md:text-xl">{error.message}</p>
        <div className="pt-4">
          <Button onClick={reset} className="text-center">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
