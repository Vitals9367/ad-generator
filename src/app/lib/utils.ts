import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  const wordCount = textOnly.split(/\s+/).length;
  const readingTimeMinutes = (wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} min read`;
}

// Function to convert uppercase with spaces to lowercase with dashes
export const toKebabCase = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, "-");
};

// Function to convert lowercase with dashes to uppercase with spaces
export const fromKebabCase = (str: string): string => {
  return str.replace(/-/g, " ").toUpperCase();
};

export const getDefaultImageUrl = () => {
  return "/hero.jpg";
};

export const getImageUrl = (placeId: string, imageId: string) => {
  return `https://${env.NEXT_PUBLIC_SPACES_REGION}.digitaloceanspaces.com/escape-rooms/${placeId}/${imageId}.jpg`;
};

export const baseMetadata = {
  title: {
    template: "%s | Best Escape Rooms Near You",
    default: "Best Escape Rooms Near Me | Local Escape Room Finder",
  },
  description:
    "Find top-rated escape rooms in your area. Compare local escape room prices, reviews, and availability. Book instantly and save with our exclusive deals near you.",
  keywords: [
    "escape rooms near me",
    "best escape rooms nearby",
    "local escape rooms",
    "escape room locations",
    "escape room reviews",
    "group activities near me",
    "team building activities nearby",
    "indoor activities near me",
    "escape room prices",
    "escape room booking",
  ],
  authors: [{ name: "EscapeRoomFinder" }],
  creator: "EscapeRoomFinder",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: "Local Escape Room Finder",
    title:
      "Find the Best Escape Rooms Near You | Local Reviews & Instant Booking",
    description:
      "Discover and compare the highest-rated escape rooms in your area. Read local reviews, check real-time availability, and find the perfect room near you.",
    images: [
      {
        url: "/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Find Top-Rated Local Escape Rooms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Local Escape Rooms Near You | Instant Booking",
    description:
      "Find and book top-rated escape rooms in your area. Compare prices, read local reviews, and get exclusive deals on nearby escape rooms.",
    creator: "@escapefinder",
    images: ["/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: env.NEXT_PUBLIC_SITE_URL,
  },
  category: "Local Entertainment",
  locationRelevance: "Local Business",
};

// Helper function to format text to title case (first letter uppercase, rest lowercase)
export const toTitleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
