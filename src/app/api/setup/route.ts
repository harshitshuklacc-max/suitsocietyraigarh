import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supabaseUrl,
      supabaseAnonKey,
      supabaseServiceKey,
      razorpayKeyId,
      razorpayKeySecret,
      siteUrl,
      dbPassword,
    } = body;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase credentials are required" }, { status: 400 });
    }

    const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
${dbPassword ? `SUPABASE_DB_PASSWORD=${dbPassword}\n` : ""}${razorpayKeyId ? `RAZORPAY_KEY_ID=${razorpayKeyId}\n` : ""}${razorpayKeySecret ? `RAZORPAY_KEY_SECRET=${razorpayKeySecret}\n` : ""}${razorpayKeyId ? `NEXT_PUBLIC_RAZORPAY_KEY_ID=${razorpayKeyId}\n` : ""}NEXT_PUBLIC_SITE_URL=${siteUrl || "http://localhost:3000"}
`;

    writeFileSync(join(process.cwd(), ".env.local"), envContent);
    writeFileSync(join(process.cwd(), ".setup-complete"), new Date().toISOString());

    let dbInitialized = false;
    if (dbPassword) {
      try {
        const { initializeDatabase } = await import("@/lib/init-db");
        const { initializeDefaultAdmin } = await import("@/lib/auth");
        const { ensureStorageBuckets } = await import("@/lib/storage-setup");
        const initResult = await initializeDatabase(dbPassword);
        if (initResult.success) {
          dbInitialized = true;
          try {
            await initializeDefaultAdmin();
            await ensureStorageBuckets();
          } catch {
            // non-fatal
          }
        }
      } catch {
        // schema can be run from admin login
      }
    } else {
      // Initialize default admin if tables already exist
      try {
      const { createClient } = await import("@supabase/supabase-js");
      const bcrypt = await import("bcryptjs");
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: existing } = await supabase.from("admin_users").select("id").limit(1);
      if (!existing || existing.length === 0) {
        const hash = await bcrypt.hash("SuitXSociety@123897254", 12);
        await supabase.from("admin_users").insert({
          username: "SUiTsOcIety",
          password_hash: hash,
        });
      }
    } catch {
      // Admin table may not exist yet - user needs to run schema
    }
    }

    return NextResponse.json({
      success: true,
      dbInitialized,
      message: dbInitialized
        ? "Setup complete. Database initialized!"
        : "Setup complete. Initialize database from Admin Login if needed.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 }
    );
  }
}
