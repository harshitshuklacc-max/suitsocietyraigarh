import type { Metadata } from "next";
import { InfoPageShell } from "@/components/shop/info-page-shell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for shopping at Suit Society.",
};

export default function TermsPage() {
  return (
    <InfoPageShell title="Terms & Conditions" subtitle="Please read these terms carefully before placing an order.">
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">General</h2>
          <p>
            By accessing and placing an order on Suit Society, you agree to comply with these terms and conditions.
            We reserve the right to update these terms at any time without prior notice.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Orders &amp; Payments</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All orders are subject to product availability and confirmation.</li>
            <li>Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
            <li>We accept secure online payments through our integrated payment gateway.</li>
            <li>Once an order is placed, order details will be shared on the WhatsApp number provided during checkout.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Product Information</h2>
          <p>
            We strive to display accurate product images, colors, and descriptions. However, slight variations may occur
            due to screen settings, lighting, or handcrafted details. Such variations are not considered defects.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Shipping &amp; Delivery</h2>
          <p>
            Delivery timelines may vary based on location, product availability, and courier operations.
            Tracking information will be shared on your registered WhatsApp number when available.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Contact</h2>
          <p>
            For questions regarding these terms, please visit our{" "}
            <a href="/contact" className="text-gold hover:underline">Contact Us</a> page.
          </p>
        </section>
      </div>
    </InfoPageShell>
  );
}
