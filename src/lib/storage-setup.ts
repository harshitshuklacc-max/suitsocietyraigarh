import { createServiceClient } from "@/lib/supabase/server";

const BUCKETS = [
  { name: "products", public: true },
  { name: "banners", public: true },
  { name: "videos", public: true },
];

export async function ensureStorageBuckets(): Promise<void> {
  const supabase = createServiceClient();

  for (const bucket of BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name);
    if (existing) continue;

    await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 52428800,
    });
  }
}
