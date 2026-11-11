/**
 * Simple single-admin auth: username + password from env (or local-dev fallback),
 * session stored in an HMAC-signed, HttpOnly cookie.
 */
import type { AstroCookies } from 'astro';
import { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET } from 'astro:env/server';

export const SESSION_COOKIE = 'admin_session';
const SESSION_DAYS = 7;

// Local development only. In production (Vercel) the env vars are required.
const DEV_USERNAME = 'admin';
const DEV_PASSWORD = 'admin123';
const DEV_SECRET = 'dev-only-secret-change-me-in-production';

const isProd = import.meta.env.PROD;

function config() {
  const username = ADMIN_USERNAME || (isProd ? '' : DEV_USERNAME);
  const password = ADMIN_PASSWORD || (isProd ? '' : DEV_PASSWORD);
  const secret = SESSION_SECRET || (isProd ? '' : DEV_SECRET);
  return { username, password, secret, configured: !!(username && password && secret.length >= 16) };
}

export const usingDevCredentials = () => !ADMIN_USERNAME || !ADMIN_PASSWORD;
export const authConfigured = () => config().configured;

const enc = new TextEncoder();

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(sig).toString('base64url');
}

/** Constant-time string comparison (compares HMACs so lengths always match). */
async function safeEqual(a: string, b: string, secret: string) {
  const [ha, hb] = await Promise.all([hmac(a, secret), hmac(b, secret)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0 && ha.length === hb.length;
}

export async function checkCredentials(username: string, password: string) {
  const c = config();
  if (!c.configured) return false;
  const [u, p] = await Promise.all([safeEqual(username, c.username, c.secret), safeEqual(password, c.password, c.secret)]);
  return u && p;
}

export async function createSession(cookies: AstroCookies, username: string) {
  const c = config();
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString('base64url');
  const token = `${payload}.${await hmac(payload, c.secret)}`;
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function readSession(cookies: AstroCookies): Promise<{ username: string } | null> {
  const c = config();
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token || !c.configured) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  if (!(await safeEqual(sig, await hmac(payload, c.secret), c.secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { u: string; exp: number };
    if (data.exp < Date.now() || data.u !== c.username) return null;
    return { username: data.u };
  } catch {
    return null;
  }
}

export function destroySession(cookies: AstroCookies) {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

/* ---------- Login throttling (per IP, in memory) ---------- */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

export function loginLockedFor(ip: string): number {
  const a = attempts.get(ip);
  if (!a || a.until < Date.now()) return 0;
  return Math.ceil((a.until - Date.now()) / 1000);
}
export function recordLoginFailure(ip: string) {
  const a = attempts.get(ip) ?? { count: 0, until: 0 };
  a.count += 1;
  if (a.count >= MAX_ATTEMPTS) {
    a.until = Date.now() + LOCK_MS;
    a.count = 0;
  }
  attempts.set(ip, a);
}
export function clearLoginFailures(ip: string) {
  attempts.delete(ip);
}
