import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/** Storage abstraction so the local-disk backend can later be swapped for S3 or similar. */
export interface FileStorage {
  /** Saves bytes and returns the URL path the file is served from. */
  save(bytes: Uint8Array, extension: string): Promise<string>;
  read(fileName: string): Promise<Uint8Array | null>;
  remove(urlPath: string): Promise<void>;
}

export const UPLOAD_URL_PREFIX = "/uploads/";

/** Generated names only: a UUID plus one of the allowed extensions. */
export const SAFE_FILE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

// Outside /public on purpose: files are served by an authenticated route handler.
const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

class LocalDiskStorage implements FileStorage {
  async save(bytes: Uint8Array, extension: string) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    // Nothing from the user's original file name reaches the disk.
    const fileName = `${randomUUID()}.${extension}`;
    await writeFile(path.join(UPLOAD_DIR, fileName), bytes);
    return UPLOAD_URL_PREFIX + fileName;
  }

  async read(fileName: string) {
    if (!SAFE_FILE_NAME.test(fileName)) return null;
    return readFile(path.join(UPLOAD_DIR, fileName)).catch(() => null);
  }

  async remove(urlPath: string) {
    const fileName = path.basename(urlPath);
    if (!urlPath.startsWith(UPLOAD_URL_PREFIX) || !SAFE_FILE_NAME.test(fileName)) return;
    await unlink(path.join(UPLOAD_DIR, fileName)).catch(() => undefined);
  }
}

export const storage: FileStorage = new LocalDiskStorage();
