import { notFound } from "next/navigation"
import { getTimeTable } from "@/app/(time-table)/_lib/supabase-actions"
import { addHour, formatTimeTableDate } from "@/app/(time-table)/_lib/helper-funtions"
import { addTask, updateTaskTag } from "@/app/(time-table)/time-managment/_lib/time-tables-functions"
import { getTimeTag, TIME_TAGS } from "@/app/(time-table)/time-managment/_lib/time-tags"
import { TaskTagForm } from "../_components/TagTaskForm"

export default async function TimeTablePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const timeTable = await getTimeTable(id).catch(() => notFound())
    const formatted = formatTimeTableDate(timeTable.date)

    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">{formatted.day}</h1>
                <p className="text-sm text-muted-foreground">{formatted.date}</p>
            </div>

            <div className="divide-y rounded-lg border">
                {timeTable.tasks.map((item, index) => (
                    <div key={`${item.startTime}-${item.endTime}-${index}`} className="flex items-center gap-6 px-4 py-3">
                        <span className="w-32 shrink-0 text-sm text-muted-foreground">
                            {item.startTime} – {item.endTime}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium">{item.task}</span>
                        <TaskTagForm id={id} taskIndex={index} tagId={item.tagId} />
                    </div>
                ))}
            </div>

            <AddTaskForm id={id} startTime={timeTable.tasks.at(-1)?.endTime} />
        </main>
    )
}

function AddTaskForm({ id, startTime }: { id: string; startTime?: string }) {
    const now = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })
    const start = startTime ?? now
    const end = addHour(start)

    return (
        <form action={addTask.bind(null, id)} className="flex items-center gap-3 px-4 py-3">
            <input name="startTime" type="time" defaultValue={start} className="w-24 bg-transparent text-sm text-muted-foreground outline-none" />
            <span className="text-muted-foreground">–</span>
            <input name="endTime" type="time" defaultValue={end} className="w-24 bg-transparent text-sm text-muted-foreground outline-none" />
            <input name="task" placeholder="What did you do?" autoComplete="off" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </form>
    )
}