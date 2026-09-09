import Link from "next/link";
import {
  CalendarDays,
  Edit3,
  MessageCircle,
  Save,
  UserRound,
} from "lucide-react";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export const metadata = {
  title: "โปรไฟล์",
  description: "จัดการโปรไฟล์สมาชิก AniSOL",
};

interface ProfilePageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function ProfilePage({
  searchParams,
}: ProfilePageProps) {
  const query = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนเปิดหน้าโปรไฟล์",
      )}`,
    );
  }

  const [
    { data: profile, error: profileError },
    { data: threads, error: threadsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        id,
        username,
        display_name,
        bio,
        role,
        created_at,
        updated_at
      `)
      .eq("id", user.id)
      .single(),

    supabase
      .from("threads")
      .select(`
        id,
        title,
        body,
        is_spoiler,
        view_count,
        created_at,
        comments (
          id
        ),
        thread_likes (
          user_id
        )
      `)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (profileError || !profile) {
    console.error("Unable to load profile:", profileError);

    redirect(
      `/login?error=${encodeURIComponent(
        "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
      )}`,
    );
  }

  if (threadsError) {
    console.error("Unable to load profile threads:", threadsError);
  }

  const joinedAt = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "long",
  }).format(new Date(profile.created_at));

  const roleLabel: Record<string, string> = {
    member: "สมาชิก",
    moderator: "ผู้ดูแล",
    admin: "ผู้ดูแลระบบ",
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-32 bg-linear-to-r from-violet-700 via-violet-600 to-fuchsia-500 sm:h-40" />

          <div className="px-6 pb-7 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-violet-100 text-violet-600 shadow-sm dark:border-zinc-900 dark:bg-violet-950 dark:text-violet-300 sm:size-28">
                  <UserRound className="size-12" />
                </div>

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black sm:text-3xl">
                      {profile.display_name ?? "สมาชิก AniSOL"}
                    </h1>

                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      {roleLabel[profile.role] ?? "สมาชิก"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    {profile.username
                      ? `@${profile.username}`
                      : "ยังไม่ได้ตั้งชื่อผู้ใช้"}
                  </p>
                </div>
              </div>

              <a
                href="#edit-profile"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 text-sm font-semibold transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-zinc-700 dark:hover:bg-violet-950/40"
              >
                <Edit3 className="size-4" />
                แก้ไขโปรไฟล์
              </a>
            </div>

            {profile.bio ? (
              <p className="mt-6 max-w-2xl whitespace-pre-wrap wrap-break-word text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-6 text-sm text-zinc-400">
                ยังไม่มีประวัติย่อ
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" />
                เข้าร่วมเมื่อ {joinedAt}
              </span>
              <span>
                กระทู้ทั้งหมด {threads?.length ?? 0}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 text-violet-600" />
              <h2 className="text-xl font-black">กระทู้ของฉัน</h2>
            </div>

            <div className="mt-4 space-y-3">
              {threads && threads.length > 0 ? (
                threads.map((thread) => (
                  <article
                    key={thread.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-violet-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {thread.is_spoiler && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
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

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                      {thread.is_spoiler
                        ? "เนื้อหานี้อาจมีการเปิดเผยเรื่องราว"
                        : thread.body}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
                      <time dateTime={thread.created_at}>
                        {new Intl.DateTimeFormat("th-TH", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(thread.created_at))}
                      </time>
                      <span>เข้าชม {thread.view_count}</span>
                      <span>
                        ความคิดเห็น {thread.comments.length}
                      </span>
                      <span>
                        ถูกใจ {thread.thread_likes.length}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                  <MessageCircle className="mx-auto size-9 text-zinc-400" />
                  <h3 className="mt-3 font-bold">ยังไม่มีกระทู้</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    เริ่มต้นแบ่งปันเรื่องราวกับคอมมูนิตี้
                  </p>
                  <Link
                    href="/community/new"
                    className="mt-5 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    ตั้งกระทู้
                  </Link>
                </div>
              )}
            </div>
          </section>

          <aside id="edit-profile" className="scroll-mt-24">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-black">แก้ไขโปรไฟล์</h2>
              <p className="mt-1 text-sm text-zinc-500">
                ข้อมูลนี้จะแสดงในคอมมูนิตี้
              </p>

              {query.error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {query.error}
                </div>
              )}

              {query.message && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {query.message}
                </div>
              )}

              <form action={updateProfile} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    ชื่อที่แสดง
                  </span>
                  <input
                    name="displayName"
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    defaultValue={profile.display_name ?? ""}
                    className="h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    ชื่อผู้ใช้
                  </span>
                  <div className="flex">
                    <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-zinc-300 bg-zinc-100 px-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
                      @
                    </span>
                    <input
                      name="username"
                      type="text"
                      required
                      minLength={3}
                      maxLength={24}
                      pattern="[a-z0-9_]+"
                      defaultValue={profile.username ?? ""}
                      placeholder="your_name"
                      autoCapitalize="none"
                      autoCorrect="off"
                      className="h-11 min-w-0 flex-1 rounded-r-xl border border-zinc-300 bg-transparent px-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
                    />
                  </div>
                  <span className="mt-1.5 block text-xs text-zinc-500">
                    ใช้ตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข และ _
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    ประวัติย่อ
                  </span>
                  <textarea
                    name="bio"
                    rows={5}
                    maxLength={300}
                    defaultValue={profile.bio ?? ""}
                    placeholder="แนะนำตัวหรืออนิเมะเรื่องโปรด..."
                    className="w-full resize-y rounded-xl border border-zinc-300 bg-transparent px-3 py-3 text-sm leading-6 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
                  />
                  <span className="mt-1.5 block text-xs text-zinc-500">
                    ไม่เกิน 300 ตัวอักษร
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    อีเมล
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user.email ?? ""}
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Save className="size-4" />
                  บันทึกโปรไฟล์
                </button>
              </form>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}