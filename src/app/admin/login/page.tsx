"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAdmin } from "@/actions/auth";
import { toast } from "sonner";
import { Loader2, Lock, AlertTriangle, Database, ExternalLink } from "lucide-react";
import { DEFAULT_ADMIN } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const [showDbSetup, setShowDbSetup] = useState(true);
  const [dbPassword, setDbPassword] = useState("");
  const [form, setForm] = useState<{ username: string; password: string }>({
    username: DEFAULT_ADMIN.username,
    password: DEFAULT_ADMIN.password,
  });

  const projectRef =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ||
    "khzhehimnnruushenboh";

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        const ready = Boolean(data.dbReady);
        setDbReady(ready);
        setShowDbSetup(!ready);
      })
      .catch(() => {
        setDbReady(false);
        setShowDbSetup(true);
      });
  }, []);

  const handleInitDb = async () => {
    if (!dbPassword) {
      toast.error("Enter your Supabase database password");
      return;
    }
    setInitLoading(true);
    try {
      const res = await fetch("/api/setup/init-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      toast.success("Database ready! Logging you in...");
      setDbReady(true);
      setShowDbSetup(false);

      const result = await loginAdmin(form.username, form.password);
      if (result.success) {
        router.push("/admin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Database setup failed");
    } finally {
      setInitLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dbReady === false) {
      toast.error("Please initialize the database first.");
      setShowDbSetup(true);
      return;
    }
    setLoading(true);
    const result = await loginAdmin(form.username, form.password);
    if (result.success) {
      toast.success("Welcome back!");
      router.push("/admin");
    } else {
      toast.error(result.error || "Login failed");
      if (result.error?.includes("Database not set up")) {
        setDbReady(false);
        setShowDbSetup(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen luxury-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Lock className="w-10 h-10 mx-auto text-gold mb-2" />
          <CardTitle className="font-serif text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">Suit Society Admin Panel</p>
        </CardHeader>
        <CardContent>
          {dbReady === false && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-950 dark:text-amber-100">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-3 w-full">
                  <div>
                    <p className="font-medium">One-time database setup required</p>
                    <p className="text-amber-900/80 dark:text-amber-100/80 mt-1">
                      Enter your Supabase <strong>database password</strong> below and click Initialize.
                      Find it at Supabase → Settings → Database → Database password.
                    </p>
                  </div>

                  <a
                    href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                  >
                    Open Supabase SQL Editor <ExternalLink className="w-3 h-3" />
                  </a>

                  {showDbSetup && (
                    <div className="space-y-2 pt-1">
                      <Label>Database Password</Label>
                      <Input
                        type="password"
                        placeholder="Supabase → Settings → Database → Password"
                        value={dbPassword}
                        onChange={(e) => setDbPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="gold"
                        className="w-full"
                        disabled={initLoading}
                        onClick={handleInitDb}
                      >
                        {initLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Database className="w-4 h-4 mr-1" /> Initialize Database
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {!showDbSetup && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDbSetup(true)}
                    >
                      Show setup again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button
              type="submit"
              variant="luxury"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
