import { requireAdmin, unauthorized } from "@/lib/admin-crud";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_videos")
    .select("id, url, title, product_id, product:products(id, name, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ data: [], error: error.message });
  }

  return Response.json({ data: data || [] });
}
