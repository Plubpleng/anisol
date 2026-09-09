"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteThread } from "@/app/community/actions";

interface ThreadOwnerActionsProps {
  threadId: string;
}

export function ThreadOwnerActions({
  threadId,
}: ThreadOwnerActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/community/${threadId}/edit`}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-violet-950/40"
      >
        <Pencil className="size-4" />
        แก้ไข
      </Link>

      <form
        action={deleteThread}
        onSubmit={(event) => {
          const confirmed = window.confirm(
            "ต้องการลบกระทู้นี้หรือไม่? ความคิดเห็นและข้อมูลที่เกี่ยวข้องจะถูกลบและไม่สามารถกู้คืนได้",
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="threadId" value={threadId} />

        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
        >
          <Trash2 className="size-4" />
          ลบกระทู้
        </button>
      </form>
    </div>
  );
}