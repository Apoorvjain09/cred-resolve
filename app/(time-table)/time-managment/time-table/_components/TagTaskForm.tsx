"use client"

import { useState } from "react"
import { updateTaskTag } from "@/app/(time-table)/time-managment/_lib/time-tables-functions"
import { getTimeTag, TIME_TAGS } from "@/app/(time-table)/time-managment/_lib/time-tags"

export function TaskTagForm({ id, taskIndex, tagId }: { id: string; taskIndex: number; tagId?: string }) {
    const [selected, setSelected] = useState(tagId ?? "")
    const tag = getTimeTag(selected)

    return (
        <select
            value={selected}
            onChange={(e) => {
                setSelected(e.target.value)
                updateTaskTag(id, taskIndex, e.target.value)
            }}
            className={`w-full rounded border px-2 py-1 text-xs outline-none sm:w-36 ${tag?.className ?? "bg-transparent text-muted-foreground"}`}
        >
            <option value="" disabled>Tag</option>

            {TIME_TAGS.map((tag) => (
                <option key={tag.id} value={tag.id}>
                    {tag.label}
                </option>
            ))}
        </select>
    )
}
