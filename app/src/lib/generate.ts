import { mockGenerate, type GenerateResult } from "./mock-generate";
import type { Property, UploadedImage } from "./types";

export async function generateNote(
  review: string,
  property: Property,
  images: UploadedImage[] = [],
): Promise<GenerateResult> {
  try {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
      /\/$/,
      "",
    );
    const response = await fetch(`${apiBaseUrl}/api/generate-note`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ review, property, images }),
    });

    const payload = (await response.json().catch(() => null)) as
      | GenerateResult
      | { ok: false; code?: string; error?: string }
      | null;

    if (
      response.status === 503 &&
      payload &&
      "code" in payload &&
      payload.code === "AI_KEY_MISSING"
    ) {
      return mockGenerate(review, property);
    }

    if (!response.ok || !payload) {
      return { ok: false, error: "生成失败，请稍后重试。本次不计入额度。" };
    }

    return payload as GenerateResult;
  } catch {
    return mockGenerate(review, property);
  }
}
