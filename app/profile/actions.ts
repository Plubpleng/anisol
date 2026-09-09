"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function profileUrl(type: "error" | "message", message: string) {
  return `/profile?${type}=${encodeURIComponent(message)}`;
}

export async function updateProfile(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();

  if (displayName.length < 2 || displayName.length > 50) {
    redirect(
      profileUrl(
        "error",
        "ชื่อที่แสดงต้องมีความยาว 2–50 ตัวอักษร",
      ),
    );
  }

  if (username.length < 3 || username.length > 24) {
    redirect(
      profileUrl(
        "error",
        "ชื่อผู้ใช้ต้องมีความยาว 3–24 ตัวอักษร",
      ),
    );
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    redirect(
      profileUrl(
        "error",
        "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข และ _",
      ),
    );
  }

  if (bio.length > 300) {
    redirect(
      profileUrl(
        "error",
        "ประวัติย่อต้องมีความยาวไม่เกิน 300 ตัวอักษร",
      ),
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนแก้ไขโปรไฟล์",
      )}`,
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      username,
      bio: bio || null,
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Update profile failed:", error);

    if (error.code === "23505") {
      redirect(
        profileUrl(
          "error",
          "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น",
        ),
      );
    }

    redirect(
      profileUrl(
        "error",
        "ไม่สามารถบันทึกโปรไฟล์ได้ กรุณาลองใหม่",
      ),
    );
  }

  if (!data) {
    redirect(
      profileUrl(
        "error",
        "ไม่พบโปรไฟล์หรือคุณไม่มีสิทธิ์แก้ไข",
      ),
    );
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/community");

  redirect(
    profileUrl(
      "message",
      "บันทึกโปรไฟล์เรียบร้อยแล้ว",
    ),
  );
}