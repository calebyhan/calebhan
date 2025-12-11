import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request) {
  // Block this endpoint in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Admin endpoints are disabled in production" },
      { status: 403 }
    );
  }

  try {
    const { photos } = await request.json();

    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json(
        { error: "Invalid photos data" },
        { status: 400 }
      );
    }

    // Path to photos.json in public/data directory
    const filePath = path.join(process.cwd(), "public", "data", "photos.json");

    // Write updated photos array to file
    await fs.writeFile(filePath, JSON.stringify(photos, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving photos:", error);
    return NextResponse.json(
      { error: "Failed to save photos" },
      { status: 500 }
    );
  }
}
