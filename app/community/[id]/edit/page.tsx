import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { updateThread } from "../../actions";

interface EditThreadPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function EditThreadPage({
  params,
  searchParams,
}: EditThreadPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: thread, error },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("threads")
      .select("id, author_id, title, body, is_spoiler")
      .eq("id", id)
      .single(),
  ]);

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนแก้ไขกระทู้",
      )}`,
    );
  }

  if (error || !thread) {
    notFound();
  }

  if (thread.author_id !== user.id) {
    redirect(
      `/community/${id}?error=${encodeURIComponent(
        "คุณไม่มีสิทธิ์แก้ไขกระทู้นี้",
      )}`,
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={`/community/${thread.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-violet-600"
        >
          <ArrowLeft className="size-4" />
          กลับไปยังกระทู้
        </Link>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-black">แก้ไขกระทู้</h1>
          <p className="mt-2 text-sm text-zinc-500">
            ปรับปรุงหัวข้อและเนื้อหาของกระทู้
          </p>

          {query.error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {query.error}
            </div>
          )}

          <form action={updateThread} className="mt-7 space-y-5">
            <input type="hidden" name="threadId" value={thread.id} />

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                หัวข้อกระทู้
              </span>
              <input
                name="title"
                type="text"
                required
                minLength={3}
                maxLength={160}
                defaultValue={thread.title}
                className="h-12 w-full rounded-xl border border-zinc-300 bg-transparent px-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                เนื้อหา
              </span>
              <textarea
                name="body"
                required
                minLength={1}
                maxLength={10000}
                rows={12}
                defaultValue={thread.body}
                className="w-full resize-y rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-sm leading-7 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <input
                name="isSpoiler"
                type="checkbox"
                defaultChecked={thread.is_spoiler}
                className="mt-0.5 size-4 accent-violet-600"
              />
              <span>
                <span className="block text-sm font-semibold">
                  กระทู้นี้มีเนื้อหาสปอยล์
                </span>
                <span className="mt-1 block text-xs text-zinc-500">
                  ระบบจะแสดงคำเตือนเนื้อหาสปอยล์แก่ผู้อ่าน
                </span>
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <Link
                href={`/community/${thread.id}`}
                className="inline-flex h-11 items-center rounded-xl border border-zinc-300 px-5 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                ยกเลิก
              </Link>

              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Save className="size-4" />
                บันทึกการแก้ไข
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}