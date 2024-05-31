"use client";

import { CaseColor } from "@prisma/client";
import { useRef, useState } from "react";
import { AspectRatio } from "./ui/AspectRatio";

export default function PhonePreview({
  croppedImageUrl,
  color,
}: {
  croppedImageUrl: string;
  color: CaseColor;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [renderedDimensions, setRenderedDimensions] = useState({
    width: 0,
    height: 0,
  });
  return (
    <AspectRatio ref={ref} ratio={3000 / 2001} className="relative">
      <div
        className="absolute z-20 scale-[1.0352]"
        style={{
          left:
            renderedDimensions.width / 2 -
            renderedDimensions.width / (1216 / 121),
        }}
      ></div>
    </AspectRatio>
  );
}
