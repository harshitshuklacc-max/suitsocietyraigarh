import { createServiceClient } from "@/lib/supabase/server";
import { MAX_VIDEO_SIZE_BYTES } from "@/lib/upload-limits";

const BUCKETS = [
  { name: "products", public: true, fileSizeLimit: 52428800 },
  { name: "banners", public: true, fileSizeLimit: 52428800 },
  { name: "videos", public: true, fileSizeLimit: MAX_VIDEO_SIZE_BYTES },
];

export async function ensureStorageBuckets(): Promise<void> {
  const supabase = createServiceClient();

  for (const bucket of BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name);
    if (existing) {
      await supabase.storage.updateBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
      });
      continue;
    }

    await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
    });
  }
}
