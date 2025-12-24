"use client"

import { useEffect, useState } from "react"
import { Balance, calculateBalances, Group, SplitType } from "../_lib/expense-store"
import * as db from "../_lib/expense-db"

export function useExpenseStore() {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    db.getGroups().then(setGroups)
  }, [])

  return {
    groups,

    createGroup: async (name: string, members: string[]) => {
      const group = await db.createGroup(name, members)
      setGroups((prev) => [...prev, group])
    },

    addExpense: async (
      groupId: string,
      description: string,
      amount: number,
      paidBy: string,
      splitType: SplitType,
      splits: Record<string, number>,
    ) => {
      await db.addExpense(groupId, description, amount, paidBy, splitType, splits)
      setGroups(await db.getGroups())
    },

    editExpense: async (
      _groupId: string,
      expenseId: string,
      updates: any,
    ) => {
      await db.editExpense(expenseId, updates)
      setGroups(await db.getGroups())
    },

    deleteExpense: async (_groupId: string, expenseId: string) => {
      await db.deleteExpense(expenseId)
      setGroups(await db.getGroups())
    },

    getGroup: (id: string) => groups.find((g) => g.id === id),

    getBalances: (groupId: string): Balance[] => {
      const group = groups.find((g) => g.id === groupId)
      if (!group) return []
      return calculateBalances(group.expenses, group.members)
    },
  }
}