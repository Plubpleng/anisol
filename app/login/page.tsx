import Link from "next/link";
import { LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { login, signup } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{
    mode?: string;
    error?: string;
    message?: string;
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const isSignup = params.mode === "signup";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Sparkles className="size-5" />
          </span>
          <span className="text-2xl font-black tracking-tight">
            Ani<span className="text-violet-600">SOL</span>
          </span>
        </Link>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold">
            {isSignup ? "สร้างบัญชีใหม่" : "ยินดีต้อนรับกลับ"}
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {isSignup
              ? "สมัครสมาชิกเพื่อเข้าร่วมคอมมูนิตี้ AniSOL"
              : "เข้าสู่ระบบเพื่อพูดคุยและบันทึกอนิเมะที่ชอบ"}
          </p>

          {params.error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {params.error}
            </div>
          )}

          {params.message && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              {params.message}
            </div>
          )}

          <form
            action={isSignup ? signup : login}
            className="mt-6 space-y-4"
          >
            {isSignup && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  ชื่อที่แสดง
                </span>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    name="displayName"
                    type="text"
                    required
                    minLength={2}
                    maxLength={50}
                    autoComplete="name"
                    placeholder="ชื่อของคุณ"
                    className="h-11 w-full rounded-xl border border-zinc-300 bg-transparent pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium">อีเมล</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-transparent pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                รหัสผ่าน
              </span>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={
                    isSignup ? "new-password" : "current-password"
                  }
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-transparent pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
                />
              </div>
            </label>

            {isSignup && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  ยืนยันรหัสผ่าน
                </span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className="h-11 w-full rounded-xl border border-zinc-300 bg-transparent pl-10 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700"
                  />
                </div>
              </label>
            )}

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              {isSignup ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {isSignup ? "มีบัญชีแล้ว?" : "ยังไม่มีบัญชี?"}{" "}
            <Link
              href={isSignup ? "/login" : "/login?mode=signup"}
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              {isSignup ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}