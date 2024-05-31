import { Suspense } from "react";
import ThankYou from "./ThakYou";

export default function Page() {
  return (
    <>
      <Suspense>
        <ThankYou />
      </Suspense>
    </>
  );
}
