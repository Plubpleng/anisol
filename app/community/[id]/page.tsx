import Link from "next/link";
import { ArrowLeft, Eye, ShieldAlert, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

interface ThreadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: thread, error } = await supabase
    .from("threads")
    .select(`
      id,
      title,
      body,
      is_spoiler,
      view_count,
      created_at,
      author:profiles!threads_author_id_fkey (
        display_name,
        username,
        avatar_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !thread) {
    notFound();
  }

  const author = Array.isArray(thread.author)
    ? thread.author[0]
    : thread.author;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-violet-600"
        >
          <ArrowLeft className="size-4" />
          กลับไปคอมมูนิตี้
        </Link>

        <article className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          {thread.is_spoiler && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <ShieldAlert className="size-4" />
              กระทู้นี้มีเนื้อหาสปอยล์
            </div>
          )}

          <h1 className="text-2xl font-black leading-tight sm:text-3xl">
            {thread.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950">
                <UserRound className="size-4" />
              </span>
              {author?.display_name ?? author?.username ?? "สมาชิก AniSOL"}
            </span>
            <span>
              {new Intl.DateTimeFormat("th-TH", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(thread.created_at))}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="size-4" />
              {thread.view_count}
            </span>
          </div>

          <div className="mt-8 whitespace-pre-wrap border-t border-zinc-200 pt-8 text-base leading-8 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            {thread.body}
          </div>
        </article>
      </main>
    </div>
  );
}