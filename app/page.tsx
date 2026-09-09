import Link from "next/link";
import { ArrowRight, MessageCircle, Newspaper, Play } from "lucide-react";
import { AnimeCard } from "@/components/anime-card";
import { SiteHeader } from "@/components/site-header";
import { getTrendingAnime } from "@/lib/anilist";

export default async function HomePage() {
  const anime = await getTrendingAnime();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
          <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="absolute -right-20 -top-32 size-80 rounded-full bg-violet-600/40 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-violet-100">
                <Play className="size-3.5 fill-current" />
                คอมมูนิตี้สำหรับคนรักอนิเมะ
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                ค้นพบ พูดคุย
                <span className="block text-violet-400">
                  และสนุกไปด้วยกัน
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
                ติดตามอนิเมะมาใหม่ อ่านข่าวสาร และร่วมพูดคุยกับแฟนอนิเมะ
                ในคอมมูนิตี้ AniSOL
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/anime"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
                >
                  สำรวจอนิเมะ
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="/community"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
                >
                  <MessageCircle className="size-4" />
                  เข้าร่วมพูดคุย
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-violet-600">
                กำลังเป็นกระแส
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                อนิเมะยอดนิยม
              </h2>
            </div>

            <Link
              href="/anime"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-violet-600 dark:text-zinc-300"
            >
              ดูทั้งหมด
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {anime.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {anime.map((item) => (
                <AnimeCard key={item.id} anime={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
              ไม่สามารถโหลดข้อมูลอนิเมะได้ กรุณาลองใหม่ภายหลัง
            </div>
          )}
        </section>

        <section className="border-y border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2">
            <Link
              href="/news"
              className="group rounded-2xl border border-zinc-200 p-6 transition hover:border-violet-300 hover:shadow-sm dark:border-zinc-800"
            >
              <Newspaper className="size-7 text-violet-600" />
              <h2 className="mt-4 text-xl font-bold">ข่าวสารอนิเมะ</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                ติดตามประกาศ ซีซันใหม่ ตัวอย่าง และข่าวสารล่าสุด
              </p>
            </Link>

            <Link
              href="/community"
              className="group rounded-2xl border border-zinc-200 p-6 transition hover:border-violet-300 hover:shadow-sm dark:border-zinc-800"
            >
              <MessageCircle className="size-7 text-violet-600" />
              <h2 className="mt-4 text-xl font-bold">คอมมูนิตี้</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                ตั้งกระทู้ แสดงความคิดเห็น และแบ่งปันเรื่องโปรดของคุณ
              </p>
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-zinc-500 sm:px-6">
        © {new Date().getFullYear()} AniSOL — Anime Community
      </footer>
    </div>
  );
}