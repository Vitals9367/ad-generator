export const DALLE_CONFIGS = {
  square: "1024x1024",
  portrait: "1024x1792",
  landscape: "1792x1024",
} as const;

export const ORIENTATION_CONFIGS = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 1024, height: 1536 },
  landscape: { width: 1440, height: 1024 },
} as const;
