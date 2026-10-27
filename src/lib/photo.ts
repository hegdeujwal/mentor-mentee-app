// Pure validation for profile photos, kept free of I/O so it can be unit tested.

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export const PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type PhotoMime = keyof typeof PHOTO_TYPES;

/** Detects the real image type from the file's first bytes. */
export function sniffImageType(bytes: Uint8Array): PhotoMime | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

export type PhotoCheck =
  | { ok: true; mime: PhotoMime; extension: string }
  | { ok: false; error: string };

/**
 * Accepts a photo only if its declared type is allowed, its size is within
 * the limit, and its content actually matches the declared type.
 */
export function validatePhoto(input: { type: string; size: number; bytes: Uint8Array }): PhotoCheck {
  if (input.size === 0) return { ok: false, error: "The selected file is empty." };
  if (input.size > MAX_PHOTO_BYTES) return { ok: false, error: "Photo must be 2 MB or smaller." };
  if (!(input.type in PHOTO_TYPES)) {
    return { ok: false, error: "Only JPG, PNG or WEBP images are allowed." };
  }
  const detected = sniffImageType(input.bytes);
  if (detected !== input.type) {
    return { ok: false, error: "The file content does not match its image type." };
  }
  return { ok: true, mime: detected, extension: PHOTO_TYPES[detected] };
}
