import Link from "next/link"
import { getOrCreateTodayTimeTable } from "./_lib/time-tables-functions"
import { getTimeTables } from "../_lib/supabase-actions"

export default async function TimeManagementPage() {
    await getOrCreateTodayTimeTable()
    const timeTables = await getTimeTables()

    return (
        <main className="mx-auto max-w-2xl px-4 py-5 sm:p-6">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-semibold">Time Management</h1>
                <p className="text-sm text-muted-foreground">
                    Your daily time tables
                </p>
            </div>

            <div className="divide-y rounded-lg border">
                {timeTables.map((item) => {
                    const date = new Date(`${item.date}T00:00:00`)

                    const day = date.toLocaleDateString("en-IN", {
                        weekday: "long",
                    })

                    const formattedDate = date.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })

                    return (
                        <Link
                            key={item.id}
                            href={`/time-managment/time-table/${item.id}`}
                            className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <span className="text-sm font-medium">
                                {day}
                            </span>

                            <span className="text-sm text-muted-foreground">
                                {formattedDate}
                            </span>
                        </Link>
                    )
                })}
            </div>

            <a
                href="/tasks-managment"
                className="fixed bottom-4 right-4 text-xs underline text-muted-foreground hover:text-foreground"
            >
                Tasks
            </a>
        </main>
    )
}
