import { createServiceClient } from "@/lib/supabase/server";
import { MAX_VIDEO_SIZE_BYTES } from "@/lib/upload-limits";

const BUCKETS = [
  { name: "products", public: true, fileSizeLimit: 52428800 },
  { name: "banners", public: true, fileSizeLimit: 52428800 },
  { name: "images", public: true, fileSizeLimit: 52428800 },
  { name: "videos", public: true, fileSizeLimit: MAX_VIDEO_SIZE_BYTES },
] as const;

export async function ensureStorageBucket(bucketName: string): Promise<void> {
  const supabase = createServiceClient();
  const bucket =
    BUCKETS.find((item) => item.name === bucketName) ?? {
      name: bucketName,
      public: true,
      fileSizeLimit: 52428800,
    };

  const { data: existing } = await supabase.storage.getBucket(bucket.name);
  if (existing) {
    await supabase.storage.updateBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
    });
    return;
  }

  await supabase.storage.createBucket(bucket.name, {
    public: bucket.public,
    fileSizeLimit: bucket.fileSizeLimit,
  });
}

export async function ensureStorageBuckets(): Promise<void> {
  for (const bucket of BUCKETS) {
    await ensureStorageBucket(bucket.name);
  }
}
