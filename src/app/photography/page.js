import { Suspense } from "react";
import { readFile } from "fs/promises";
import { join } from "path";
import PhotographyPageContent from "./PhotographyPageContent";

export default async function PhotographyPage() {
  const photos = JSON.parse(
    await readFile(join(process.cwd(), "public/data/photos.json"), "utf-8")
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-xl">Loading gallery...</div>
        </div>
      }
    >
      <PhotographyPageContent initialPhotos={photos} />
    </Suspense>
  );
}
