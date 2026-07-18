import { createClient } from "@/lib/supabase/client";

interface SignedUploadResponse {
  path: string;
  token: string;
  publicUrl: string;
  error?: string;
}

export async function uploadAdminVideo(file: File, bucket = "videos"): Promise<string> {
  const signedRes = await fetch("/api/admin/upload/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type || "video/mp4",
      size: file.size,
      bucket,
    }),
  });

  const signed = (await signedRes.json()) as SignedUploadResponse;
  if (!signedRes.ok) {
    throw new Error(signed.error || "Could not prepare upload");
  }

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(signed.path, signed.token, file, {
    contentType: file.type || "video/mp4",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return signed.publicUrl;
}
