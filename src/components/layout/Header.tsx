"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, Phone } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_CONFIG } from "@/lib/utils";

interface HeaderProps {
  categories?: { id: string; name: string; slug: string }[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
      <div className="bg-luxury-black text-white text-xs py-1.5 text-center tracking-wider">
        <Phone className="inline w-3 h-3 mr-1" />
        {SITE_CONFIG.phone} | Free Shipping on orders above ₹2,999
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="font-serif text-2xl md:text-3xl tracking-widest text-luxury-black">
            SUIT <span className="text-gold">SOCIETY</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm tracking-wider hover:text-gold transition-colors">SHOP ALL</Link>
            {categories.slice(0, 5).map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="text-sm tracking-wider hover:text-gold transition-colors">
                {cat.name.toUpperCase()}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-gold transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/wishlist" className="hover:text-gold transition-colors hidden md:block">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/account" className="hover:text-gold transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative hover:text-gold transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-4"
            >
              <form action="/products" method="GET" className="flex gap-2">
                <Input
                  name="search"
                  placeholder="Search for suits, blazers, kurtas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="luxury">Search</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link href="/products" className="block py-2 text-sm tracking-wider" onClick={() => setMobileOpen(false)}>SHOP ALL</Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="block py-2 text-sm tracking-wider" onClick={() => setMobileOpen(false)}>
                  {cat.name.toUpperCase()}
                </Link>
              ))}
              <Link href="/wishlist" className="block py-2 text-sm tracking-wider" onClick={() => setMobileOpen(false)}>WISHLIST</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
