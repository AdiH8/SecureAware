"use client";

import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  variant?: "full" | "mark";
  priority?: boolean;
  className?: string;
}

export function BrandLogo({
  href = "/",
  variant = "full",
  priority = false,
  className = "",
}: BrandLogoProps) {
  const src = variant === "mark" ? "/secureaware-mark.svg" : "/secureaware-logo.svg";
  const width = variant === "mark" ? 48 : 174;
  const height = variant === "mark" ? 48 : 44;

  const image = (
    <Image
      src={src}
      alt="SecureAware"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex items-center">
      {image}
    </Link>
  );
}
