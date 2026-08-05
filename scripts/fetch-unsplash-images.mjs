#!/usr/bin/env node
// One-time content fetch — pulls a curated photo per landing-page slot from
// Unsplash and writes them to src/data/hero-images.json. The app reads that
// file at build/render time; it never calls the Unsplash API itself, so
// there's no per-page-load request and no dependency on Unsplash's rate
// limits (50 req/hour on the free tier) at runtime.
//
// Usage: npm run fetch:images
// Rerun any time you want to refresh the picture set, then commit the
// updated JSON.

import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error("UNSPLASH_ACCESS_KEY is not set. Add it to .env and re-run `npm run fetch:images`.");
  process.exit(1);
}

// One search query per slot used on the landing page (src/app/page.tsx).
const SLOTS = {
  hero: "university campus students walking",
  student: "student dorm room interior",
  landlord: "modern apartment building exterior",
  agent: "real estate agent handing over house keys",
};

const APP_NAME = "StudentNest";
const UTM = `utm_source=${encodeURIComponent(APP_NAME)}&utm_medium=referral`;

async function fetchPhoto(query) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Unsplash request failed for "${query}": ${res.status} ${body}`);
  }

  const data = await res.json();
  const photo = data.results?.[0];
  if (!photo) {
    throw new Error(`No Unsplash results for "${query}"`);
  }

  return {
    query,
    id: photo.id,
    url: photo.urls.regular,
    alt: photo.alt_description || query,
    width: photo.width,
    height: photo.height,
    color: photo.color,
    photographerName: photo.user.name,
    photographerUrl: `${photo.user.links.html}?${UTM}`,
    unsplashUrl: `${photo.links.html}?${UTM}`,
  };
}

async function main() {
  console.log(`Fetching ${Object.keys(SLOTS).length} images from Unsplash…`);

  const entries = [];
  // Sequential, not parallel — stays well clear of Unsplash's rate limit
  // and keeps error messages attributable to a single query.
  for (const [slot, query] of Object.entries(SLOTS)) {
    const photo = await fetchPhoto(query);
    console.log(`  ${slot}: "${photo.alt}" by ${photo.photographerName}`);
    entries.push([slot, photo]);
  }

  const images = Object.fromEntries(entries);

  const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "hero-images.json");
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(images, null, 2) + "\n");
  console.log(`\nWrote ${entries.length} images to src/data/hero-images.json — commit this file.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
