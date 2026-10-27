import "server-only";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "@/lib/db";

/** Storage abstraction so the backend can later be swapped for S3 or similar. */
export interface FileStorage {
  /** Saves bytes and returns the URL path the file is served from. */
  save(bytes: Uint8Array, extension: string): Promise<string>;
  read(fileName: string): Promise<Uint8Array | null>;
  remove(urlPath: string): Promise<void>;
}

export const UPLOAD_URL_PREFIX = "/uploads/";

/** Generated names only: a UUID plus one of the allowed extensions. */
export const SAFE_FILE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

// Photos are at most 2 MB, so they fit comfortably in the database. This keeps them
// private (served only by the authenticated route handler) and works on hosts
// without a persistent filesystem.
class DatabaseStorage implements FileStorage {
  async save(bytes: Uint8Array, extension: string) {
    // Nothing from the user's original file name is stored.
    const name = `${randomUUID()}.${extension}`;
    await prisma.storedFile.create({ data: { name, bytes: Buffer.from(bytes) } });
    return UPLOAD_URL_PREFIX + name;
  }

  async read(fileName: string) {
    if (!SAFE_FILE_NAME.test(fileName)) return null;
    const file = await prisma.storedFile.findUnique({ where: { name: fileName }, select: { bytes: true } });
    return file ? new Uint8Array(file.bytes) : null;
  }

  async remove(urlPath: string) {
    const fileName = path.basename(urlPath);
    if (!urlPath.startsWith(UPLOAD_URL_PREFIX) || !SAFE_FILE_NAME.test(fileName)) return;
    await prisma.storedFile.deleteMany({ where: { name: fileName } });
  }
}

export const storage: FileStorage = new DatabaseStorage();
