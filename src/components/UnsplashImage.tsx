import Image from "next/image";
import type { HeroImage } from "@/lib/hero-images";

/**
 * Renders a cached Unsplash photo (see src/lib/hero-images.ts) with the
 * attribution Unsplash's API guidelines require, or a branded gradient
 * placeholder if `npm run fetch:images` hasn't been run yet.
 */
export function UnsplashImage({
  image,
  className = "",
  sizes = "100vw",
  priority = false,
}: {
  image: HeroImage | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!image) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 ${className}`}
      >
        <span className="text-sm font-medium text-emerald-50/80">StudentNest</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      <p className="absolute bottom-1 right-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] leading-tight text-white/90">
        Photo by{" "}
        <a href={image.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {image.photographerName}
        </a>{" "}
        on{" "}
        <a href={image.unsplashUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Unsplash
        </a>
      </p>
    </div>
  );
}
