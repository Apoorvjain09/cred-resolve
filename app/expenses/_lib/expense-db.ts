import { supabase } from "@/lib/supabase"
import { Expense, getColorForUser, Group, SplitType, User } from "./expense-store"

/* ------------------ GROUPS ------------------ */

export async function createGroup(
    name: string,
    memberNames: string[],
): Promise<Group> {
    const { data: group, error } = await supabase
        .from("groups")
        .insert({ name })
        .select()
        .single()

    if (error) throw error

    const members: User[] = memberNames.map((name, index) => ({
        name,
        color: getColorForUser(index),
        group_id: group.id,
    })) as any

    const { data: insertedMembers, error: memberError } = await supabase
        .from("group_members")
        .insert(members)
        .select()

    if (memberError) throw memberError

    return {
        id: group.id,
        name: group.name,
        members: insertedMembers,
        expenses: [],
        createdAt: group.created_at,
    }
}

export async function getGroups(): Promise<Group[]> {
    const { data, error } = await supabase
        .from("groups")
        .select(`
      id,
      name,
      created_at,
      group_members (
        id, name, color
      ),
      expenses (
        id, description, amount, paid_by, split_type, created_at,
        expense_splits ( user_id, value )
      )
    `)

    if (error) throw error

    return data.map(mapGroup)
}

/* ------------------ EXPENSES ------------------ */

export async function addExpense(
    groupId: string,
    description: string,
    amount: number,
    paidBy: string,
    splitType: SplitType,
    splits: Record<string, number>,
) {
    const { data: expense, error } = await supabase
        .from("expenses")
        .insert({
            group_id: groupId,
            description,
            amount,
            paid_by: paidBy,
            split_type: splitType,
        })
        .select()
        .single()

    if (error) throw error

    const splitRows = Object.entries(splits).map(([userId, value]) => ({
        expense_id: expense.id,
        user_id: userId,
        value,
    }))

    const { error: splitError } = await supabase
        .from("expense_splits")
        .insert(splitRows)

    if (splitError) throw splitError
}

export async function editExpense(
    expenseId: string,
    updates: Partial<Omit<Expense, "id" | "groupId" | "date">>,
) {
    await supabase.from("expenses").update({
        description: updates.description,
        amount: updates.amount,
        paid_by: updates.paidBy,
        split_type: updates.splitType,
    }).eq("id", expenseId)

    if (updates.splits) {
        await supabase.from("expense_splits").delete().eq("expense_id", expenseId)

        const rows = Object.entries(updates.splits).map(([userId, value]) => ({
            expense_id: expenseId,
            user_id: userId,
            value,
        }))

        await supabase.from("expense_splits").insert(rows)
    }
}

export async function deleteExpense(expenseId: string) {
    await supabase.from("expenses").delete().eq("id", expenseId)
}

/* ------------------ MAPPERS ------------------ */

function mapGroup(row: any): Group {
    return {
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        members: row.group_members,
        expenses: row.expenses.map((e: any) => ({
            id: e.id,
            groupId: row.id,
            description: e.description,
            amount: Number(e.amount),
            paidBy: e.paid_by,
            splitType: e.split_type,
            splits: Object.fromEntries(
                e.expense_splits.map((s: any) => [s.user_id, Number(s.value)])
            ),
            date: e.created_at,
        })),
    }
}