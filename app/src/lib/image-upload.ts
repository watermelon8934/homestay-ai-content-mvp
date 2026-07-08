import type { UploadedImage } from "./types";

const MAX_SIDE = 1400;
const JPEG_QUALITY = 0.82;

export async function filesToUploadedImages(
  files: FileList | File[],
  existingCount: number,
  maxCount = 6,
): Promise<{ images: UploadedImage[]; skipped: number }> {
  const slots = Math.max(0, maxCount - existingCount);
  const picked = Array.from(files)
    .filter((file) => file.type.startsWith("image/"))
    .slice(0, slots);

  const images = await Promise.all(picked.map(fileToUploadedImage));
  const skipped = Math.max(0, Array.from(files).length - picked.length);
  return { images, skipped };
}

async function fileToUploadedImage(file: File): Promise<UploadedImage> {
  const source = await readFileAsDataUrl(file);
  const dataUrl = await resizeImage(source);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    dataUrl,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function resizeImage(source: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(source);
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    image.onerror = () => resolve(source);
    image.src = source;
  });
}
