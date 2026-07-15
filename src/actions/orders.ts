"use server";

import { getUserSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";
import { revalidatePath } from "next/cache";
import { CartItem } from "@/types";

interface CheckoutData {
  items: CartItem[];
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  couponCode?: string;
  userId?: string;
}

export async function validateCoupon(code: string, subtotal: number, productIds: string[]) {
  const supabase = await createServiceClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (!coupon) return { valid: false, error: "Invalid coupon code" };
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { valid: false, error: "Coupon usage limit reached" };
  }
  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return { valid: false, error: `Minimum order value is ₹${coupon.min_order_value}` };
  }
  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    return { valid: false, error: "Coupon not yet active" };
  }
  if (coupon.ends_at && new Date(coupon.ends_at) < new Date()) {
    return { valid: false, error: "Coupon has expired" };
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = subtotal * (coupon.discount_value / 100);
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
  } else {
    discount = coupon.discount_value;
  }

  return { valid: true, discount: Math.round(discount), coupon };
}

export async function createOrder(data: CheckoutData) {
  const session = await getUserSession();
  if (!session) return { error: "Please login to place an order" };

  const supabase = await createServiceClient();
  const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let couponDiscount = 0;

  if (data.couponCode) {
    const result = await validateCoupon(
      data.couponCode,
      subtotal,
      data.items.map((i) => i.productId)
    );
    if (result.valid && result.discount !== undefined) couponDiscount = result.discount;
  }

  const total = subtotal - couponDiscount;
  const orderNumber = generateOrderNumber();

  const { data: order, error } = await supabase.from("orders").insert({
    order_number: orderNumber,
    user_id: session.id,
    subtotal,
    coupon_code: data.couponCode || null,
    coupon_discount: couponDiscount,
    total,
    shipping_name: data.shippingName,
    shipping_phone: data.shippingPhone,
    shipping_address: data.shippingAddress,
    shipping_city: data.shippingCity,
    shipping_state: data.shippingState,
    shipping_pincode: data.shippingPincode,
    payment_method: "razorpay",
    payment_status: "pending",
    status: "pending",
  }).select().single();

  if (error) return { error: error.message };

  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const { data: products } = await supabase
    .from("products")
    .select("id, barcode, sku")
    .in("id", productIds);
  const codeByProduct = new Map(
    (products || []).map((p) => [p.id, p.barcode || p.sku || null])
  );

  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_code: codeByProduct.get(item.productId) || null,
    product_image: item.image,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));

  await supabase.from("order_items").insert(orderItems);

  const razorpayOrder = await createRazorpayOrder(total, orderNumber);
  await supabase.from("orders").update({ razorpay_order_id: razorpayOrder.id }).eq("id", order.id);

  return {
    orderId: order.id,
    orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: total,
  };
}

export async function verifyPayment(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) return { error: "Payment verification failed" };

  const supabase = await createServiceClient();
  const { data: order } = await supabase.from("orders").select("*, items:order_items(*)").eq("id", orderId).single();
  if (!order) return { error: "Order not found" };

  await supabase.from("orders").update({
    payment_status: "paid",
    status: "confirmed",
    razorpay_payment_id: razorpayPaymentId,
  }).eq("id", orderId);

  // Deduct stock
  for (const item of order.items) {
    if (item.product_id) {
      const { data: product } = await supabase.from("products").select("stock, sales_count").eq("id", item.product_id).single();
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase.from("products").update({ stock: newStock, sales_count: (product.sales_count || 0) + item.quantity }).eq("id", item.product_id);
        await supabase.from("inventory").insert({
          product_id: item.product_id,
          type: "sale",
          quantity: item.quantity,
          previous_stock: product.stock,
          new_stock: newStock,
        });
      }
    }
  }

  if (order.coupon_code) {
    const { data: coupon } = await supabase.from("coupons").select("usage_count").eq("code", order.coupon_code).single();
    if (coupon) {
      await supabase.from("coupons").update({ usage_count: coupon.usage_count + 1 }).eq("code", order.coupon_code);
    }
  }

  revalidatePath("/admin/orders");
  return { success: true, orderNumber: order.order_number };
}

export async function getOrders(status?: string) {
  const supabase = await createServiceClient();
  let query = supabase.from("orders").select("*, items:order_items(*)").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;
  return data || [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function getUserOrders(userId: string) {
  const supabase = await createServiceClient();
  const { data: user } = await supabase.from("users").select("phone").eq("id", userId).single();
  const phone = user?.phone;

  let query = supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  if (phone) {
    query = query.or(`user_id.eq.${userId},shipping_phone.eq.${phone}`);
  } else {
    query = query.eq("user_id", userId);
  }

  const { data } = await query;
  return data || [];
}
