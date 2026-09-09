import Link from "next/link";
import {
  LogOut,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/", label: "หน้าแรก" },
  { href: "/anime", label: "อนิเมะ" },
  { href: "/news", label: "ข่าวสาร" },
  { href: "/community", label: "คอมมูนิตี้" },
];

// ใน components/site-header.tsx

export async function SiteHeader() {
  const supabase = await createClient();
  
  // เรียกใช้ getUser พร้อมตรวจสอบ session ใหม่เสมอ
  const { data: { user } } = await supabase.auth.getUser();

  // ดึงชื่อจากตาราง profiles แทนการดึงจาก user_metadata
  // เพราะ user_metadata มักจะไม่อัปเดตทันที
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user?.id ?? "")
    .single();

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "สมาชิก";

  // ... ส่วนแสดงผลที่เหลือใช้ displayName ตัวนี้

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-xl font-black tracking-tight">
            Ani<span className="text-violet-600">SOL</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-violet-600 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="ค้นหา"
            className="rounded-xl p-2.5 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Search className="size-5" />
          </button>

          <Link
            href="/community"
            aria-label="คอมมูนิตี้"
            className="rounded-xl p-2.5 text-zinc-600 transition hover:bg-zinc-100 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <MessageCircle className="size-5" />
          </Link>

          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
              >
                <UserRound className="size-4" />
                <span className="hidden max-w-32 truncate sm:inline">
                  {displayName}
                </span>
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  aria-label="ออกจากระบบ"
                  className="rounded-xl p-2.5 text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <LogOut className="size-5" />
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <UserRound className="size-4" />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}