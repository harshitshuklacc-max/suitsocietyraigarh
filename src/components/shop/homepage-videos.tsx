"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { HomepageVideo } from "@/types";

interface HomepageVideosProps {
  videos: HomepageVideo[];
}

export function HomepageVideos({ videos }: HomepageVideosProps) {
  if (!videos.length) return null;

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="font-serif text-2xl md:text-3xl tracking-wider">WATCH & SHOP</h2>
        <p className="text-muted-foreground text-sm mt-1">Style reels from Suit Society</p>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {videos.map((video) => (
          <div key={video.id} className="snap-start shrink-0 w-[42vw] md:w-[22vw] lg:w-[18vw]">
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </section>
  );
}

function VideoCard({ video }: { video: HomepageVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.play().catch(() => undefined);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const content = (
    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-black/5">
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.thumbnail_url || undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        className="w-full h-full object-cover"
      />
      {video.title && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-xs md:text-sm font-medium line-clamp-2">{video.title}</p>
        </div>
      )}
    </div>
  );

  if (video.product_id && video.product?.slug) {
    return (
      <Link href={`/products/${video.product.slug}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
