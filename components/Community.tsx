import Image from "next/image";
import type { SiteContent } from "@/lib/content";

export default function Community({ content }: { content: SiteContent }) {
  const { community, images } = content;
  return (
    <section className="bg-blush-50 px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
          {community.eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {community.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-700">{community.body}</p>

        <figure className="mt-6 overflow-hidden rounded-xl2 bg-white shadow-sm">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={images.yardSign.src}
              alt={images.yardSign.alt}
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="px-4 py-3 text-sm italic text-ink-700">
            {community.photoCaption}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
