import Link from "next/link";
import {
  Clock3,
  Eye,
  MessageCircle,
  Plus,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "คอมมูนิตี้",
  description: "พูดคุยและแบ่งปันเรื่องราวอนิเมะกับสมาชิก AniSOL",
};

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data: threads, error } = await supabase
    .from("threads")
    .select(`
      id,
      title,
      body,
      is_spoiler,
      is_pinned,
      view_count,
      created_at,
      author:profiles!threads_author_id_fkey (
        display_name,
        username,
        avatar_url
      ),
      comments (
        id
      ),
      thread_likes (
        user_id
      )
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Unable to load threads:", error);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              AniSOL Community
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              พื้นที่พูดคุยของคนรักอนิเมะ
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              ตั้งกระทู้ แลกเปลี่ยนความคิดเห็น และแบ่งปันเรื่องโปรดกับสมาชิก
            </p>
          </div>

          <Link
            href="/community/new"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus className="size-4" />
            ตั้งกระทู้
          </Link>
        </section>

        <section className="mt-8 space-y-3">
          {threads && threads.length > 0 ? (
            threads.map((thread) => {
              const author = Array.isArray(thread.author)
                ? thread.author[0]
                : thread.author;

              return (
                <article
                  key={thread.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-violet-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-800"
                >
                  <div className="flex gap-4">
                    <div className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 sm:flex dark:bg-violet-950">
                      <UserRound className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {thread.is_pinned && (
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            ปักหมุด
                          </span>
                        )}

                        {thread.is_spoiler && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <ShieldAlert className="size-3" />
                            สปอยล์
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/community/${thread.id}`}
                        className="mt-2 block text-lg font-bold leading-7 transition hover:text-violet-600"
                      >
                        {thread.title}
                      </Link>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        {thread.is_spoiler
                          ? "เนื้อหานี้อาจมีการเปิดเผยเรื่องราว"
                          : thread.body}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
                        <span>
                          {author?.display_name ??
                            author?.username ??
                            "สมาชิก AniSOL"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3.5" />
                          {new Intl.DateTimeFormat("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(thread.created_at))}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3.5" />
                          {thread.view_count}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="size-3.5" />
                          {thread.comments.length}
                        </span>
                        <span>ถูกใจ {thread.thread_likes.length}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <MessageCircle className="mx-auto size-10 text-zinc-400" />
              <h2 className="mt-4 text-lg font-bold">ยังไม่มีกระทู้</h2>
              <p className="mt-2 text-sm text-zinc-500">
                มาเป็นคนแรกที่เริ่มพูดคุยใน AniSOL
              </p>
              <Link
                href="/community/new"
                className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                ตั้งกระทู้แรก
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}