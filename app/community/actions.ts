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

export async function createComment(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!threadId) {
    redirect("/community");
  }

  if (body.length < 1 || body.length > 5000) {
    redirect(
      `/community/${threadId}?error=${encodeURIComponent(
        "ความคิดเห็นต้องมีความยาว 1–5,000 ตัวอักษร",
      )}`,
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น",
      )}`,
    );
  }

  const { error } = await supabase.from("comments").insert({
    thread_id: threadId,
    author_id: user.id,
    body,
  });

  if (error) {
    console.error("Create comment failed:", error);

    redirect(
      `/community/${threadId}?error=${encodeURIComponent(
        "ไม่สามารถส่งความคิดเห็นได้ กรุณาลองใหม่",
      )}`,
    );
  }

  revalidatePath(`/community/${threadId}`);
  revalidatePath("/community");
  redirect(`/community/${threadId}#comments`);
}

export async function deleteComment(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");
  const commentId = String(formData.get("commentId") ?? "");

  if (!threadId || !commentId) {
    redirect("/community");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนดำเนินการ",
      )}`,
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Delete comment failed:", error);

    redirect(
      `/community/${threadId}?error=${encodeURIComponent(
        "ไม่สามารถลบความคิดเห็นนี้ได้",
      )}`,
    );
  }

  revalidatePath(`/community/${threadId}`);
  revalidatePath("/community");
  redirect(`/community/${threadId}#comments`);
}

export async function toggleThreadLike(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");

  if (!threadId) {
    redirect("/community");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนกดถูกใจ",
      )}`,
    );
  }

  const { data: existingLike, error: findError } = await supabase
    .from("thread_likes")
    .select("thread_id")
    .eq("thread_id", threadId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (findError) {
    console.error("Find thread like failed:", findError);

    redirect(
      `/community/${threadId}?error=${encodeURIComponent(
        "ไม่สามารถตรวจสอบสถานะถูกใจได้",
      )}`,
    );
  }

  if (existingLike) {
    const { error } = await supabase
      .from("thread_likes")
      .delete()
      .eq("thread_id", threadId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Remove thread like failed:", error);

      redirect(
        `/community/${threadId}?error=${encodeURIComponent(
          "ไม่สามารถยกเลิกถูกใจได้",
        )}`,
      );
    }
  } else {
    const { error } = await supabase.from("thread_likes").insert({
      thread_id: threadId,
      user_id: user.id,
    });

    if (error) {
      console.error("Add thread like failed:", error);

      redirect(
        `/community/${threadId}?error=${encodeURIComponent(
          "ไม่สามารถกดถูกใจได้",
        )}`,
      );
    }
  }

  revalidatePath(`/community/${threadId}`);
  revalidatePath("/community");
  redirect(`/community/${threadId}`);
}

export async function updateThread(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isSpoiler = formData.get("isSpoiler") === "on";

  if (!threadId) {
    redirect("/community");
  }

  const editUrl = (error: string) =>
    `/community/${threadId}/edit?error=${encodeURIComponent(error)}`;

  if (title.length < 3 || title.length > 160) {
    redirect(editUrl("หัวข้อต้องมีความยาว 3–160 ตัวอักษร"));
  }

  if (body.length < 1 || body.length > 10000) {
    redirect(editUrl("เนื้อหาต้องมีความยาว 1–10,000 ตัวอักษร"));
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนแก้ไขกระทู้",
      )}`,
    );
  }

  const { data, error } = await supabase
    .from("threads")
    .update({
      title,
      body,
      is_spoiler: isSpoiler,
    })
    .eq("id", threadId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Update thread failed:", error);
    redirect(editUrl("ไม่สามารถแก้ไขกระทู้นี้ได้"));
  }

  revalidatePath("/community");
  revalidatePath(`/community/${threadId}`);
  revalidatePath(`/community/${threadId}/edit`);
  redirect(`/community/${threadId}`);
}

export async function deleteThread(formData: FormData) {
  const threadId = String(formData.get("threadId") ?? "");

  if (!threadId) {
    redirect("/community");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "กรุณาเข้าสู่ระบบก่อนลบกระทู้",
      )}`,
    );
  }

  const { data, error } = await supabase
    .from("threads")
    .delete()
    .eq("id", threadId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Delete thread failed:", error);

    redirect(
      `/community/${threadId}?error=${encodeURIComponent(
        "ไม่สามารถลบกระทู้นี้ได้",
      )}`,
    );
  }

  revalidatePath("/community");
  redirect("/community");
}