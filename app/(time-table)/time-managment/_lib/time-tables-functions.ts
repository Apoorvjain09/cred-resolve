"use server"
import { createTimeTable, getTimeTable, getTimeTables, updateTimeTable } from "../../_lib/supabase-actions"
import { TIME_TAGS } from "./time-tags"

export async function getOrCreateTodayTimeTable() {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })

    const timeTables = await getTimeTables()
    const existing = timeTables.find((item) => item.date === today)

    if (existing) return existing

    return createTimeTable({ date: today })
}

export async function addTask(id: string, formData: FormData): Promise<void> {
    const task = formData.get("task")?.toString().trim()
    const startTime = formData.get("startTime")?.toString()
    const endTime = formData.get("endTime")?.toString()

    if (!task || !startTime || !endTime) return

    const timeTable = await getTimeTable(id)
    await updateTimeTable(id, { tasks: [...timeTable.tasks, { startTime, endTime, task }] })
}

export async function updateTaskTag(id: string, taskIndex: number, tagId: string): Promise<void> {
    if (!TIME_TAGS.some((tag) => tag.id === tagId)) return

    const timeTable = await getTimeTable(id)
    const tasks = timeTable.tasks.map((task, index) =>
        index === taskIndex ? { ...task, tagId } : task
    )

    await updateTimeTable(id, { tasks })
}