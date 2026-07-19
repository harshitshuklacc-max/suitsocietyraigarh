import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/admin-crud";
import { runMigrations } from "@/lib/init-db";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const body = await request.json().catch(() => ({}));
    const dbPassword = (body.dbPassword as string | undefined) || process.env.SUPABASE_DB_PASSWORD;

    const result = await runMigrations(dbPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Database migrations applied successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    );
  }
}
