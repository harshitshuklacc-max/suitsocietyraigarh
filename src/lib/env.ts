import { readFileSync, existsSync } from "fs";
import { join } from "path";

export interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
}

const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function isSetupComplete(): boolean {
  const setupFile = join(process.cwd(), ".setup-complete");
  if (existsSync(setupFile)) return true;

  return REQUIRED_VARS.every((key) => {
    const val = process.env[key];
    return val && val.length > 0;
  });
}

export function getMissingEnvVars(): string[] {
  return REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key]!.length === 0);
}

export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing = getMissingEnvVars();
  return { valid: missing.length === 0, missing: [...missing] };
}

export function isEnvConfigured(): boolean {
  return isSetupComplete();
}

export function getEnvConfig(): EnvConfig {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
  };
}
