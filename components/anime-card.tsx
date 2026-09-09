import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Anime } from "@/lib/anilist";

interface AnimeCardProps {
  anime: Anime;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const title =
    anime.title.english ?? anime.title.romaji ?? anime.title.native;

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group block min-w-0"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-zinc-200 shadow-sm dark:bg-zinc-800">
        <Image
          src={anime.coverImage.extraLarge}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 17vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />

        {anime.averageScore && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {(anime.averageScore / 10).toFixed(1)}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent" />
      </div>

      <div className="mt-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-900 transition group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400">
          {title}
        </h3>

        <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
          {anime.genres.slice(0, 2).join(" • ") || "Anime"}
        </p>
      </div>
    </Link>
  );
}