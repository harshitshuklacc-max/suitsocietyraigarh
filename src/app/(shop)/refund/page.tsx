import type { Metadata } from "next";
import { InfoPageShell } from "@/components/shop/info-page-shell";

export const metadata: Metadata = {
  title: "Refund / Return Policy",
  description: "Refund and return policy for Suit Society orders.",
};

export default function RefundPage() {
  return (
    <InfoPageShell title="Refund / Return Policy" subtitle="Our policy for returns, exchanges, and refunds.">
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Return Eligibility</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Items must be unused, unworn, and in original condition with tags intact.</li>
            <li>Return requests should be raised within the eligible return window communicated at the time of purchase.</li>
            <li>Certain products such as customized or final-sale items may not be eligible for return.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">How to Request a Return</h2>
          <p>
            Contact our customer support team with your order details and reason for return.
            Our team will guide you through the next steps and pickup or return instructions.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Refunds</h2>
          <p>
            Approved refunds are processed to the original payment method after the returned product is received and inspected.
            Processing time may vary depending on your bank or payment provider.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Exchanges</h2>
          <p>
            Size or style exchanges are subject to stock availability. Please contact us as soon as possible if you need an exchange.
          </p>
        </section>

        <section className="rounded-xl border border-border/60 bg-muted/20 p-6">
          <h2 className="font-serif text-xl text-foreground mb-3">Need Help?</h2>
          <p>
            Visit our <a href="/contact" className="text-gold hover:underline">Contact Us</a> page or reach out via WhatsApp for assistance with returns and refunds.
          </p>
        </section>
      </div>
    </InfoPageShell>
  );
}
