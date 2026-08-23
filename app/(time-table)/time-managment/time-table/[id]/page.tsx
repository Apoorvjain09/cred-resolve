import { notFound } from "next/navigation"
import { getTimeTable } from "@/app/(time-table)/_lib/supabase-actions"
import { addHour, formatTimeTableDate } from "@/app/(time-table)/_lib/helper-funtions"
import { addTask } from "@/app/(time-table)/time-managment/_lib/time-tables-functions"
import { TaskTagForm } from "../_components/TagTaskForm"

export default async function TimeTablePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const timeTable = await getTimeTable(id).catch(() => notFound())
    const formatted = formatTimeTableDate(timeTable.date)

    return (
        <main className="mx-auto max-w-2xl px-4 py-5 sm:p-6">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-semibold">{formatted.day}</h1>
                <p className="text-sm text-muted-foreground">{formatted.date}</p>
            </div>

            <div className="divide-y rounded-lg border">
                {timeTable.tasks.map((item, index) => (
                    <div key={`${item.startTime}-${item.endTime}-${index}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-6">
                        <span className="text-sm text-muted-foreground sm:w-32 sm:shrink-0">
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
        <form action={addTask.bind(null, id)} className="grid gap-3 px-4 py-3 sm:flex sm:items-center">
            <div className="flex items-center gap-3">
                <input name="startTime" type="time" defaultValue={start} className="w-full min-w-0 bg-transparent text-sm text-muted-foreground outline-none sm:w-24" />
                <span className="text-muted-foreground">–</span>
                <input name="endTime" type="time" defaultValue={end} className="w-full min-w-0 bg-transparent text-sm text-muted-foreground outline-none sm:w-24" />
            </div>
            <input name="task" placeholder="What did you do?" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <button type="submit" className="rounded border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted sm:py-1">
                Save
            </button>
        </form>
    )
}
