import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center p-4 md:flex-row md:p-8">
      <img
        src="/snake-2.png"
        className="mb-4 h-40 w-40 md:mb-0 md:mr-8 md:h-60 md:w-60"
      />

      <div className="text-center md:text-left">
        <h1 className="mt-2 text-balance text-center text-3xl font-bold !leading-tight tracking-tight text-gray-900 md:text-left md:text-5xl">
          404: Oops! This Page Slithered Away
        </h1>
        <p className="pt-3 text-lg text-gray-700 md:text-xl">
          It looks like this page is hiding. Try slithering back to our
          homepage!
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button className="text-center">Go back to our Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
