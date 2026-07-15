import { getUserSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getUserSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, product:products(name, slug)")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  return Response.json({ reviews: data || [] });
}

export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id, rating, title, comment } = await request.json();
  if (!product_id || !rating) {
    return Response.json({ error: "Product and rating required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        product_id,
        user_id: session.id,
        rating,
        title,
        comment,
        is_approved: false,
      },
      { onConflict: "product_id,user_id" }
    )
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ review: data, message: "Review submitted for approval" });
}
