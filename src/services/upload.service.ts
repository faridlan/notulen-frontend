import { BASE_URL } from "../helpers/fetcher";
import type { UploadedFile } from "../types/UploadResponse";

export async function uploadImages(files: File[]): Promise<UploadedFile[]> {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));

  const res = await fetch(`${BASE_URL}/upload/images`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<UploadedFile[]>;
}
