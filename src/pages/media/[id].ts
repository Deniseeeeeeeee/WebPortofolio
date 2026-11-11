import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { getMedia } from '../../lib/media';

export const prerender = false;

const WIDTHS = [320, 480, 640, 800, 1200, 1600];

export const GET: APIRoute = async ({ params, url }) => {
  const id = params.id ?? '';
  if (!/^[a-f0-9]{32}$/.test(id)) return new Response('Not found', { status: 404 });
  const media = await getMedia(id);
  if (!media) return new Response('Not found', { status: 404 });

  // Media ids never change content, so they can be cached forever
  const headers: Record<string, string> = {
    'Content-Type': media.mime,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  };
  let body: ArrayBuffer | Uint8Array = media.data;

  if (media.mime === 'application/pdf') {
    headers['Content-Disposition'] = 'inline; filename="CV_Denise_Aditya.pdf"';
  } else {
    const w = Number(url.searchParams.get('w'));
    if (WIDTHS.includes(w) && w < media.width) {
      body = new Uint8Array(await sharp(Buffer.from(media.data)).resize({ width: w }).webp({ quality: 80 }).toBuffer());
    }
  }
  return new Response(body as BodyInit, { headers });
};
