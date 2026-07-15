"use client";

import { useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminHeader,
  AdminCard,
  AdminButton,
  AdminInput,
} from "@/components/admin/AdminLayout";
import { BRAND, DEFAULT_ADMIN } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState<{ username: string; must_change_credentials?: boolean } | null>(null);
  const [form, setForm] = useState({
    username: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setAdmin(d.admin);
        setForm((f) => ({ ...f, username: d.admin?.username || "" }));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password && !form.currentPassword) {
      toast.error("Current password is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          currentPassword: form.currentPassword || undefined,
          password: form.password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Settings updated successfully");
      setForm((f) => ({ ...f, currentPassword: "", password: "", confirmPassword: "" }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminHeader title="Settings" description="Manage admin credentials and store info" />

      {admin?.must_change_credentials && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Please change your default credentials after first login.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <h3 className="text-white font-medium mb-4">Change Admin Credentials</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Username</label>
              <AdminInput
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Current Password</label>
              <AdminInput
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">New Password</label>
              <AdminInput
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Confirm New Password</label>
              <AdminInput
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
            <AdminButton type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </AdminButton>
          </form>
        </AdminCard>

        <AdminCard>
          <h3 className="text-white font-medium mb-4">Store Information</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Brand</dt>
              <dd className="text-white">{BRAND.name}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="text-white">{BRAND.email}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Phone</dt>
              <dd className="text-white">{BRAND.phone}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Address</dt>
              <dd className="text-white">{BRAND.address}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Default Admin Username</dt>
              <dd className="text-zinc-400 font-mono">{DEFAULT_ADMIN.username}</dd>
            </div>
          </dl>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
