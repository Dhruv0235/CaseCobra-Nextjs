import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center h-[60vh] p-4 md:p-8">
      <img
        src="/snake-2.png"
        className="h-40 w-40 md:h-60 md:w-60 mb-4 md:mb-0 md:mr-8"
      />

      <div className="text-center md:text-left">
        <h1 className="mt-2 tracking-tight text-center md:text-left text-balance !leading-tight font-bold text-3xl md:text-5xl text-gray-900">
          404: Oops! This Page Slithered Away
        </h1>
        <p className="pt-3 text-gray-700 text-lg md:text-xl">
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
