"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseServiceKey: "",
    razorpayKeyId: "",
    razorpayKeySecret: "",
    siteUrl: "http://localhost:3000",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      toast.success("Setup complete! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen luxury-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-gold/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 gold-gradient rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-serif">Suit Society</CardTitle>
          <CardDescription className="text-base">
            Welcome! Configure your store to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Supabase URL</Label>
              <Input
                required
                placeholder="https://xxx.supabase.co"
                value={form.supabaseUrl}
                onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Supabase Anon Key</Label>
              <Input
                required
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                value={form.supabaseAnonKey}
                onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Supabase Service Role Key</Label>
              <Input
                required
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                value={form.supabaseServiceKey}
                onChange={(e) => setForm({ ...form, supabaseServiceKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Razorpay Key ID <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                placeholder="rzp_live_xxx or rzp_test_xxx"
                value={form.razorpayKeyId}
                onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Razorpay Key Secret <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                type="password"
                placeholder="Your Razorpay secret"
                value={form.razorpayKeySecret}
                onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Site URL</Label>
              <Input
                placeholder="http://localhost:3000"
                value={form.siteUrl}
                onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
              />
            </div>
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Configuring...</> : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
