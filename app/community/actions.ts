"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function communityUrl(error: string) {
  return `/community/new?error=${encodeURIComponent(error)}`;
}

export async function createThread(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isSpoiler = formData.get("isSpoiler") === "on";

  if (title.length < 3 || title.length > 160) {
    redirect(communityUrl("หัวข้อต้องมีความยาว 3–160 ตัวอักษร"));
  }

  if (body.length < 1 || body.length > 10000) {
    redirect(communityUrl("เนื้อหาต้องมีความยาวไม่เกิน 10,000 ตัวอักษร"));
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=กรุณาเข้าสู่ระบบก่อนตั้งกระทู้");
  }

  const { data, error } = await supabase
    .from("threads")
    .insert({
      author_id: user.id,
      title,
      body,
      is_spoiler: isSpoiler,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Create thread failed:", error);
    redirect(communityUrl("ไม่สามารถสร้างกระทู้ได้ กรุณาลองใหม่"));
  }

  revalidatePath("/community");
  redirect(`/community/${data.id}`);
}