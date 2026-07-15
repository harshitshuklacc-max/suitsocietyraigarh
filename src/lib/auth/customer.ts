import bcrypt from "bcryptjs";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isFonosterConfigured, sendOtpViaFonoster } from "@/lib/fonoster";

export async function sendOTP(phone: string): Promise<{ success?: boolean; error?: string; devOtp?: string }> {
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length !== 10) return { error: "Enter valid 10-digit phone number" };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const supabase = createServiceClient();
  await supabase.from("otp_verifications").insert({
    phone: cleanPhone,
    otp_hash: otpHash,
    expires_at: expiresAt,
  });

  if (isFonosterConfigured()) {
    try {
      const result = await sendOtpViaFonoster(cleanPhone, otp);
      if (!result.delivered && process.env.FONOSTER_OTP_FALLBACK !== "true") {
        return { error: "Failed to send OTP. Please try again." };
      }
    } catch {
      return { error: "Failed to send OTP. Please try again." };
    }
  }

  return {
    success: true,
    devOtp:
      process.env.NODE_ENV === "development" && !isFonosterConfigured()
        ? otp
        : undefined,
  };
}

export async function verifyOTP(phone: string, otp: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const supabase = createServiceClient();

  const { data: records } = await supabase
    .from("otp_verifications")
    .select("*")
    .eq("phone", cleanPhone)
    .eq("verified", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (!records?.length) return { error: "OTP expired or not found" };

  const valid = await bcrypt.compare(otp, records[0].otp_hash);
  if (!valid) return { error: "Invalid OTP" };

  await supabase.from("otp_verifications").update({ verified: true }).eq("id", records[0].id);

  const serviceClient = createServiceClient();
  const email = `${cleanPhone}@suitsociety.phone`;
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    phone: `+91${cleanPhone}`,
    email,
    email_confirm: true,
    phone_confirm: true,
  });

  let userId = authData?.user?.id;

  if (authError?.message?.includes("already")) {
    const { data: users } = await serviceClient.auth.admin.listUsers();
    const existing = users?.users?.find(
      (u) => u.phone === `+91${cleanPhone}` || u.email === email
    );
    userId = existing?.id;
  }

  if (!userId) return { error: "Failed to create user" };

  await serviceClient.from("users").upsert({
    id: userId,
    phone: cleanPhone,
  }, { onConflict: "id" });

  const serverClient = await createClient();
  const { error: signInError } = await serverClient.auth.signInWithPassword({
    email,
    password: `ss_${cleanPhone}_otp`,
  });

  if (signInError) {
    await serviceClient.auth.admin.updateUserById(userId, {
      password: `ss_${cleanPhone}_otp`,
    });
    await serverClient.auth.signInWithPassword({
      email,
      password: `ss_${cleanPhone}_otp`,
    });
  }

  return { success: true, userId };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
