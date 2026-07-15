import { NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { initializeDatabase } from "@/lib/init-db";
import { initializeDefaultAdmin } from "@/lib/auth";
import { ensureStorageBuckets } from "@/lib/storage-setup";

function persistDbPassword(password: string) {
  const envPath = join(process.cwd(), ".env.local");
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const line = `SUPABASE_DB_PASSWORD=${password}`;

  if (content.includes("SUPABASE_DB_PASSWORD=")) {
    content = content.replace(/^SUPABASE_DB_PASSWORD=.*$/m, line);
  } else {
    content = content.trimEnd() + (content.endsWith("\n") ? "" : "\n") + line + "\n";
  }

  writeFileSync(envPath, content, "utf8");
  process.env.SUPABASE_DB_PASSWORD = password;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const dbPassword = body.dbPassword as string | undefined;

    if (!dbPassword) {
      return NextResponse.json({ error: "Database password is required" }, { status: 400 });
    }

    persistDbPassword(dbPassword);

    const result = await initializeDatabase(dbPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    try {
      await initializeDefaultAdmin();
    } catch {
      // Admin seed after tables exist
    }

    try {
      await ensureStorageBuckets();
    } catch {
      // Buckets can be created manually
    }

    return NextResponse.json({
      success: true,
      message: result.error || "Database initialized. You can login now.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Initialization failed" },
      { status: 500 }
    );
  }
}
