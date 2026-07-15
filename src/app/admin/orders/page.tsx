"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AdminLayout,
  AdminHeader,
  AdminCard,
  AdminButton,
  AdminSelect,
} from "@/components/admin/AdminLayout";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  shipping_name?: string;
  shipping_phone?: string;
  created_at: string;
  user?: { full_name?: string; phone?: string };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const param = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/admin/orders${param}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      toast.success("Order status updated");
      load();
    } else {
      toast.error("Failed to update order");
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="Orders" description="Manage customer orders" />

      <div className="mb-6">
        <AdminSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="max-w-xs"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </AdminSelect>
      </div>

      <AdminCard>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        ) : !orders.length ? (
          <p className="text-zinc-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-white/10">
                  <th className="text-left py-3 px-2">Order</th>
                  <th className="text-left py-3 px-2">Customer</th>
                  <th className="text-left py-3 px-2">Payment</th>
                  <th className="text-right py-3 px-2">Amount</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 text-zinc-300">
                    <td className="py-3 px-2 font-medium">{order.order_number}</td>
                    <td className="py-3 px-2">
                      {order.shipping_name || order.user?.full_name || "-"}
                      <br />
                      <span className="text-zinc-500 text-xs">
                        {order.shipping_phone || order.user?.phone}
                      </span>
                    </td>
                    <td className="py-3 px-2 capitalize">{order.payment_status}</td>
                    <td className="py-3 px-2 text-right">{formatPrice(order.total)}</td>
                    <td className="py-3 px-2">
                      <AdminSelect
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs py-1"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </AdminSelect>
                    </td>
                    <td className="py-3 px-2 text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  );
}
