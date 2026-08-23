import { createTask, getTasks, updateTaskCompleted } from "../_lib/supabase-actions"

export default async function TasksManagementPage() {
    const tasks = await getTasks()
    const sections = [
        ["Not completed", tasks.filter((item) => !item.completed)],
        ["Completed", tasks.filter((item) => item.completed)],
    ] as const

    return (
        <main className="mx-auto max-w-2xl p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold">Tasks Management</h1>
                <p className="text-sm text-muted-foreground">Tasks with estimated completion dates</p>
            </div>

            <div className="space-y-8">
                {sections.map(([title, items]) => (
                    <section key={title}>
                        <h2 className="mb-2 text-sm font-medium">{title}</h2>
                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full text-sm">
                                <tbody className="divide-y">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <form action={updateTaskCompleted.bind(null, item.id, !item.completed)}>
                                                    <button type="submit" className="flex size-4 items-center justify-center rounded border" aria-label="Toggle completed">
                                                        {item.completed && <span className="size-2 rounded-sm bg-foreground" />}
                                                    </button>
                                                </form>
                                            </td>
                                            <td className={`w-full px-4 py-3 font-medium ${item.completed ? "text-muted-foreground line-through" : ""}`}>
                                                {item.task}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                                                {item.estimated_completion_date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}

                <form action={createTask} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                    <input name="completed" type="checkbox" className="size-4" />
                    <input name="task" placeholder="Add task" className="flex-1 bg-transparent text-sm outline-none" />
                    <input name="estimated_completion_date" type="date" className="w-36 bg-transparent text-sm text-muted-foreground outline-none" />
                </form>
            </div>

            <a
                href="/time-managment"
                className="fixed bottom-4 right-4 text-xs underline text-muted-foreground hover:text-foreground"
            >
                Time
            </a>
        </main>
    )
}
