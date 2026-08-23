"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "../../../lib/supabase"
import type { TimeTable, TimeTableTask } from "../time-managment/time-table/_types/types"

// =========================================================
// ===================== TIME TABLE ========================
// =========================================================

const TABLE = "time_management_time_tables"

export async function getTimeTables() {
    const { data, error } = await supabase.from(TABLE).select("*").order("date", { ascending: false })
    if (error) throw new Error(error.message)
    return data as TimeTable[]
}

export async function getTimeTable(id: string) {
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single()
    if (error) throw new Error(error.message)
    return data as TimeTable
}

export async function createTimeTable(input: { date: string; tasks?: TimeTableTask[] }) {
    const { data, error } = await supabase.from(TABLE).insert({ date: input.date, tasks: input.tasks ?? [] }).select().single()
    if (error) throw new Error(error.message)
    revalidatePath("/time-managment")
    return data as TimeTable
}

export async function updateTimeTable(id: string, input: Partial<Pick<TimeTable, "date" | "tasks">>) {
    const { data, error } = await supabase.from(TABLE).update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).select().single()
    if (error) throw new Error(error.message)
    revalidatePath("/time-managment")
    revalidatePath(`/time-managment/time-table/${id}`)
    return data as TimeTable
}

export async function deleteTimeTable(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/time-managment")
    return { success: true }
}

// =========================================================
// ===================== TASKS TABLE =======================
// =========================================================

export type TaskManagementTask = {
    id: string
    task: string
    estimated_completion_date: string
    completed: boolean
    created_at: string
    updated_at: string
}

const TASKS_TABLE = "time_management_tasks"

export async function getTasks() {
    const { data, error } = await supabase
        .from(TASKS_TABLE)
        .select("*")
        .order("completed", { ascending: true })
        .order("estimated_completion_date", { ascending: true })

    if (error) throw new Error(error.message)
    return data as TaskManagementTask[]
}

export async function createTask(formData: FormData) {
    const task = formData.get("task")?.toString().trim()
    const estimated_completion_date = formData.get("estimated_completion_date")?.toString()
    const completed = formData.get("completed") === "on"

    if (!task || !estimated_completion_date) return

    const { error } = await supabase.from(TASKS_TABLE).insert({ task, estimated_completion_date, completed })
    if (error) throw new Error(error.message)
    revalidatePath("/tasks-managment")
}

export async function updateTaskCompleted(id: string, completed: boolean) {
    const { error } = await supabase
        .from(TASKS_TABLE)
        .update({ completed, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/tasks-managment")
}
