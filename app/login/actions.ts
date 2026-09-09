"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function loginUrl(type: "error" | "message", message: string) {
  return `/login?${type}=${encodeURIComponent(message)}`;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(loginUrl("error", "กรุณากรอกอีเมลและรหัสผ่าน"));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(loginUrl("error", "อีเมลหรือรหัสผ่านไม่ถูกต้อง"));
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (displayName.length < 2) {
    redirect(loginUrl("error", "ชื่อที่แสดงต้องมีอย่างน้อย 2 ตัวอักษร"));
  }

  if (!email) {
    redirect(loginUrl("error", "กรุณากรอกอีเมล"));
  }

  if (password.length < 8) {
    redirect(loginUrl("error", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"));
  }

  if (password !== confirmPassword) {
    redirect(loginUrl("error", "รหัสผ่านทั้งสองช่องไม่ตรงกัน"));
  }

  const supabase = await createClient();
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: displayName,
      },
    },
  });

  if (error) {
    redirect(loginUrl("error", error.message));
  }

  if (data.session) {
    redirect("/");
  }

  redirect(
    loginUrl(
      "message",
      "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
    ),
  );
}