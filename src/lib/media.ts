/** Image + PDF uploads stored in the database, resized to WebP with sharp. */
import sharp from 'sharp';
import { getDb } from './db/client';
import type { MediaRef } from './content/types';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB request bodies
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export class UploadError extends Error {}

const newId = () => crypto.randomUUID().replace(/-/g, '');

/** Save an uploaded image (resized to fit maxWidth, WebP). Returns null when no file was chosen. */
export async function saveImage(file: FormDataEntryValue | null, maxWidth = 2000): Promise<MediaRef | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" is larger than 4 MB. Compress it first.`);
  if (!IMAGE_TYPES.includes(file.type)) throw new UploadError(`"${file.name}" is not a JPG, PNG, WebP or AVIF image.`);

  const input = Buffer.from(await file.arrayBuffer());
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const ref: MediaRef = { id: newId(), width: info.width, height: info.height, mime: 'image/webp' };
  const db = await getDb();
  await db.execute({
    sql: 'INSERT INTO media (id, mime, data, width, height, size, name) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [ref.id, ref.mime, data, ref.width, ref.height, data.length, file.name],
  });
  return ref;
}

export async function savePdf(file: FormDataEntryValue | null): Promise<MediaRef | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" is larger than 4 MB.`);
  const data = Buffer.from(await file.arrayBuffer());
  if (file.type !== 'application/pdf' || data.subarray(0, 5).toString() !== '%PDF-') {
    throw new UploadError(`"${file.name}" is not a PDF.`);
  }
  const ref: MediaRef = { id: newId(), width: 0, height: 0, mime: 'application/pdf' };
  const db = await getDb();
  await db.execute({
    sql: 'INSERT INTO media (id, mime, data, width, height, size, name) VALUES (?, ?, ?, 0, 0, ?, ?)',
    args: [ref.id, ref.mime, data, data.length, file.name],
  });
  return ref;
}

export async function deleteMedia(ref: MediaRef | null | undefined) {
  if (!ref) return;
  const db = await getDb();
  await db.execute({ sql: 'DELETE FROM media WHERE id = ?', args: [ref.id] });
}

export async function getMedia(id: string) {
  const db = await getDb();
  const r = await db.execute({ sql: 'SELECT mime, data, width FROM media WHERE id = ?', args: [id] });
  const row = r.rows[0];
  if (!row) return null;
  return { mime: String(row.mime), data: row.data as ArrayBuffer, width: Number(row.width) };
}

/** URL helpers used by the page */
export const mediaUrl = (ref: MediaRef, width?: number) => `/media/${ref.id}${width ? `?w=${width}` : ''}`;
export const srcset = (ref: MediaRef, widths: number[]) =>
  widths
    .filter((w) => w < ref.width)
    .concat(ref.width)
    .map((w) => `${mediaUrl(ref, w === ref.width ? undefined : w)} ${w}w`)
    .join(', ');
