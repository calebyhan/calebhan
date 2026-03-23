import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_CONTENT_LENGTH_BYTES = 2 * 1024 * 1024;
const MAX_PHOTOS = 5000;
const MAX_STRING_LENGTH = 500;
const MAX_TAGS = 50;
const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

const stringFields = [
  "filename",
  "camera",
  "trip",
  "description",
  "caption",
  "state",
  "country",
];

function safeEqual(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function hasUnsafeKeys(value) {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasUnsafeKeys);
  }

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_KEYS.has(key) || hasUnsafeKeys(nested)) {
      return true;
    }
  }

  return false;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidString(value) {
  return typeof value === "string" && value.length <= MAX_STRING_LENGTH;
}

function validatePhoto(photo) {
  if (!photo || typeof photo !== "object" || Array.isArray(photo)) {
    return false;
  }

  if (!(typeof photo.id === "string" || typeof photo.id === "number")) {
    return false;
  }

  for (const field of stringFields) {
    if (photo[field] !== undefined && !isValidString(photo[field])) {
      return false;
    }
  }

  if (photo.tags !== undefined) {
    if (!Array.isArray(photo.tags) || photo.tags.length > MAX_TAGS) {
      return false;
    }

    if (photo.tags.some((tag) => !isValidString(tag))) {
      return false;
    }
  }

  if (photo.location !== undefined) {
    if (!photo.location || typeof photo.location !== "object" || Array.isArray(photo.location)) {
      return false;
    }

    const { lat, lng, state, country } = photo.location;

    if (lat !== undefined && (!isFiniteNumber(lat) || lat < -90 || lat > 90)) {
      return false;
    }

    if (lng !== undefined && (!isFiniteNumber(lng) || lng < -180 || lng > 180)) {
      return false;
    }

    if (state !== undefined && !isValidString(state)) {
      return false;
    }

    if (country !== undefined && !isValidString(country)) {
      return false;
    }
  }

  return true;
}

function validatePhotosPayload(photos) {
  if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) {
    return false;
  }

  if (hasUnsafeKeys(photos)) {
    return false;
  }

  return photos.every(validatePhoto);
}

function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    // Non-browser or same-site requests may omit origin.
    return true;
  }

  return origin === `https://${host}` || origin === `http://${host}`;
}

function isAuthorized(request) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return process.env.NODE_ENV !== "production";
  }

  const cookieToken = request.cookies.get("admin_token")?.value;
  const headerToken = request.headers.get("x-admin-token");
  const providedToken = cookieToken || headerToken;

  if (!providedToken) {
    return false;
  }

  return safeEqual(providedToken, adminToken);
}

export async function POST(request) {
  // Keep production hardened by default unless explicitly enabled.
  if (process.env.NODE_ENV === "production" && process.env.ADMIN_ALLOW_PROD !== "true") {
    return NextResponse.json(
      { error: "Admin endpoints are disabled in production" },
      { status: 403 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_LENGTH_BYTES) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 }
    );
  }

  try {
    const { photos } = await request.json();

    if (!validatePhotosPayload(photos)) {
      return NextResponse.json(
        { error: "Invalid photos data" },
        { status: 400 }
      );
    }

    // Path to photos.json in public/data directory
    const filePath = path.join(process.cwd(), "public", "data", "photos.json");
    const tempFilePath = `${filePath}.tmp`;

    const payload = JSON.stringify(photos, null, 2);
    if (Buffer.byteLength(payload, "utf8") > MAX_CONTENT_LENGTH_BYTES) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }

    // Atomic write to reduce corruption risk if process exits mid-write.
    await fs.writeFile(tempFilePath, payload, "utf-8");
    await fs.rename(tempFilePath, filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving photos:", error);
    return NextResponse.json(
      { error: "Failed to save photos" },
      { status: 500 }
    );
  }
}
