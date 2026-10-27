import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, sniffImageType, validatePhoto } from "@/lib/photo";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");

describe("sniffImageType", () => {
  it("recognises JPG, PNG and WEBP signatures", () => {
    expect(sniffImageType(jpg)).toBe("image/jpeg");
    expect(sniffImageType(png)).toBe("image/png");
    expect(sniffImageType(webp)).toBe("image/webp");
  });

  it("rejects other content", () => {
    expect(sniffImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
  });
});

describe("validatePhoto", () => {
  it("accepts a real PNG within the size limit", () => {
    expect(validatePhoto({ type: "image/png", size: 1000, bytes: png })).toEqual({ ok: true, mime: "image/png", extension: "png" });
  });

  it("rejects files over 2 MB", () => {
    const result = validatePhoto({ type: "image/png", size: MAX_PHOTO_BYTES + 1, bytes: png });
    expect(result.ok).toBe(false);
  });

  it("rejects disallowed types such as GIF or SVG", () => {
    expect(validatePhoto({ type: "image/gif", size: 100, bytes: png }).ok).toBe(false);
    expect(validatePhoto({ type: "image/svg+xml", size: 100, bytes: png }).ok).toBe(false);
  });

  it("rejects a file whose content does not match its declared type", () => {
    expect(validatePhoto({ type: "image/jpeg", size: 100, bytes: png }).ok).toBe(false);
  });

  it("rejects empty files", () => {
    expect(validatePhoto({ type: "image/png", size: 0, bytes: new Uint8Array() }).ok).toBe(false);
  });
});
