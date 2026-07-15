import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("admin_users").select("id").limit(1);

    if (error) {
      const needsSchema =
        error.message.includes("admin_users") ||
        error.message.includes("schema cache") ||
        error.message.includes("does not exist");

      return NextResponse.json({
        status: needsSchema ? "needs_schema" : "error",
        service: "Suit Society",
        dbReady: false,
        message: needsSchema
          ? "Run supabase/schema.sql in your Supabase SQL Editor."
          : error.message,
      });
    }

    return NextResponse.json({
      status: "ok",
      service: "Suit Society",
      dbReady: true,
    });
  } catch {
    return NextResponse.json({
      status: "error",
      service: "Suit Society",
      dbReady: false,
      message: "Could not connect to Supabase.",
    });
  }
}
