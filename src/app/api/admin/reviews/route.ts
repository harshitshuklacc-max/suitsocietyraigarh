import { requireAdmin, unauthorized } from "@/lib/admin-crud";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const approved = new URL(request.url).searchParams.get("approved");
  const supabase = createServiceClient();

  let query = supabase
    .from("reviews")
    .select("*, product:products(name, slug), user:users(name, phone)")
    .order("created_at", { ascending: false });

  if (approved === "false") query = query.eq("is_approved", false);
  if (approved === "true") query = query.eq("is_approved", true);

  const { data } = await query;
  return Response.json({ data: data || [] });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id, is_approved } = await request.json();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({ is_approved })
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const id = new URL(request.url).searchParams.get("id");
  const supabase = createServiceClient();
  await supabase.from("reviews").delete().eq("id", id);
  return Response.json({ success: true });
}
