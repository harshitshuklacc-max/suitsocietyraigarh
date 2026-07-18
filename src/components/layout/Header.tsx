"use client";



import Link from "next/link";

import Image from "next/image";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Search, ShoppingBag, Heart, User, Menu, X, Phone } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";

import { useWishlist } from "@/context/WishlistContext";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { SITE_CONFIG } from "@/lib/utils";



const NAV_ITEMS = [

  { href: "/products", label: "ALL PRODUCTS" },

  { href: "/#shop-by-category", label: "SHOP BY CATEGORY" },

  { href: "/size-chart", label: "SIZE CHART" },

  { href: "/contact", label: "CONTACT US" },

  { href: "/track-order", label: "TRACK ORDER" },

];



export function Header() {

  const { itemCount } = useCart();

  const { items: wishlistItems } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");



  return (

    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">

      <div className="bg-luxury-black text-white text-xs py-1.5 text-center tracking-wider">

        <Phone className="inline w-3 h-3 mr-1" />

        {SITE_CONFIG.phone} | Free Delivery on orders above ₹2,999

      </div>



      <div className="container mx-auto px-4">

        <div className="flex items-center justify-between h-16 md:h-20 gap-4 md:gap-8 lg:gap-12">

          <button className="md:hidden shrink-0" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">

            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}

          </button>



          <Link href="/" className="flex items-center shrink-0">

            <div className="relative h-10 md:h-12 w-[120px] md:w-[140px]">

              <Image

                src="/logo.jpeg"

                alt="Suit Society"

                fill

                className="object-contain object-left"

                priority

              />

            </div>

          </Link>



          <nav className="hidden lg:flex items-center gap-8 xl:gap-10 flex-1 justify-center">

            {NAV_ITEMS.map((item) => (

              <Link

                key={item.href}

                href={item.href}

                className="text-xs xl:text-sm tracking-[0.18em] hover:text-gold transition-colors whitespace-nowrap"

              >

                {item.label}

              </Link>

            ))}

          </nav>



          <div className="flex items-center gap-4 md:gap-5 lg:gap-7 shrink-0">

            <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-gold transition-colors" aria-label="Search">

              <Search className="w-5 h-5" />

            </button>

            <Link href="/wishlist" className="relative hover:text-gold transition-colors hidden md:block" aria-label="Wishlist">

              <Heart className="w-5 h-5" />

              {wishlistItems.length > 0 && (

                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold text-white text-xs rounded-full flex items-center justify-center">

                  {wishlistItems.length}

                </span>

              )}

            </Link>

            <Link href="/account" className="hover:text-gold transition-colors" aria-label="Account">

              <User className="w-5 h-5" />

            </Link>

            <Link href="/cart" className="relative hover:text-gold transition-colors" aria-label="Cart">

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

            className="lg:hidden border-t overflow-hidden"

          >

            <div className="container mx-auto px-4 py-4 space-y-3">

              {NAV_ITEMS.map((item) => (

                <Link

                  key={item.href}

                  href={item.href}

                  className="block py-2 text-sm tracking-wider"

                  onClick={() => setMobileOpen(false)}

                >

                  {item.label}

                </Link>

              ))}

              <Link href="/wishlist" className="block py-2 text-sm tracking-wider" onClick={() => setMobileOpen(false)}>

                WISHLIST

              </Link>

            </div>

          </motion.nav>

        )}

      </AnimatePresence>

    </header>

  );

}

