import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  Send,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { createComment, deleteComment } from "../actions";

interface ThreadPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function ThreadPage({
  params,
  searchParams,
}: ThreadPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [
    { data: thread, error: threadError },
    { data: comments, error: commentsError },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
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
      .single(),

    supabase
      .from("comments")
      .select(`
        id,
        author_id,
        body,
        is_spoiler,
        created_at,
        updated_at,
        author:profiles!comments_author_id_fkey (
          display_name,
          username,
          avatar_url
        )
      `)
      .eq("thread_id", id)
      .is("parent_id", null)
      .order("created_at", { ascending: true }),

    supabase.auth.getUser(),
  ]);

  if (threadError || !thread) {
    notFound();
  }

  if (commentsError) {
    console.error("Unable to load comments:", commentsError);
  }

  const author = Array.isArray(thread.author)
    ? thread.author[0]
    : thread.author;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-violet-600"
        >
          <ArrowLeft className="size-4" />
          กลับไปคอมมูนิตี้
        </Link>

        {query.error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {query.error}
          </div>
        )}

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
              {author?.display_name ??
                author?.username ??
                "สมาชิก AniSOL"}
            </span>

            <time dateTime={thread.created_at}>
              {new Intl.DateTimeFormat("th-TH", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(thread.created_at))}
            </time>

            <span className="inline-flex items-center gap-1">
              <Eye className="size-4" />
              {thread.view_count}
            </span>
          </div>

          <div className="mt-8 whitespace-pre-wrap wrap-break-word border-t border-zinc-200 pt-8 text-base leading-8 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            {thread.body}
          </div>
        </article>

        <section id="comments" className="mt-8 scroll-mt-24">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-violet-600" />
            <h2 className="text-xl font-black">
              ความคิดเห็น
            </h2>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {comments?.length ?? 0}
            </span>
          </div>

          {user ? (
            <form
              action={createComment}
              className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <input type="hidden" name="threadId" value={thread.id} />

              <label
                htmlFor="comment-body"
                className="mb-2 block text-sm font-semibold"
              >
                แสดงความคิดเห็น
              </label>

              <textarea
                id="comment-body"
                name="body"
                required
                minLength={1}
                maxLength={5000}
                rows={4}
                placeholder="ร่วมพูดคุยอย่างสุภาพ..."
                className="w-full resize-y rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-sm leading-7 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Send className="size-4" />
                  ส่งความคิดเห็น
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">
                เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็น
              </p>
              <Link
                href={`/login?message=${encodeURIComponent(
                  "เข้าสู่ระบบเพื่อแสดงความคิดเห็น",
                )}`}
                className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {comments && comments.length > 0 ? (
              comments.map((comment) => {
                const commentAuthor = Array.isArray(comment.author)
                  ? comment.author[0]
                  : comment.author;

                const isOwner = user?.id === comment.author_id;

                return (
                  <article
                    key={comment.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-950">
                        <UserRound className="size-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {commentAuthor?.display_name ??
                                commentAuthor?.username ??
                                "สมาชิก AniSOL"}
                            </p>
                            <time
                              dateTime={comment.created_at}
                              className="mt-0.5 block text-xs text-zinc-500"
                            >
                              {new Intl.DateTimeFormat("th-TH", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(comment.created_at))}
                            </time>
                          </div>

                          {isOwner && (
                            <form action={deleteComment}>
                              <input
                                type="hidden"
                                name="threadId"
                                value={thread.id}
                              />
                              <input
                                type="hidden"
                                name="commentId"
                                value={comment.id}
                              />
                              <button
                                type="submit"
                                aria-label="ลบความคิดเห็น"
                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </form>
                          )}
                        </div>

                        <p className="mt-4 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
                <MessageCircle className="mx-auto size-8 text-zinc-400" />
                <p className="mt-3 text-sm font-semibold">
                  ยังไม่มีความคิดเห็น
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  มาเป็นคนแรกที่ร่วมพูดคุยในกระทู้นี้
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}