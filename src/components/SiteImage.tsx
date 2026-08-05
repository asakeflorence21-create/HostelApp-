import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

/**
 * Renders a static file from /public, or a branded placeholder if that
 * file hasn't been added yet — so the landing page never shows a broken
 * image icon while content is pending.
 */
export function SiteImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  badge,
}: {
  /** Path relative to /public, e.g. "/images/hero-property.jpg" */
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  badge?: string;
}) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));

  if (!exists) {
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
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {badge && <span className="badge-approved absolute left-2 top-2">{badge}</span>}
    </div>
  );
}
