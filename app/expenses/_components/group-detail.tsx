"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExpenseForm } from "./expense-form"
import { ExpenseList } from "./expense-list"
import { BalanceTracker } from "./balance-tracker"
import { ArrowLeft, Plus } from "lucide-react"
import { Expense, Group } from "../_lib/expense-store"

interface GroupDetailProps {
  group: Group
  balances: any[]
  onBack: () => void
  onAddExpense: (
    description: string,
    amount: number,
    paidBy: string,
    splitType: "equal" | "exact" | "percentage",
    splits: Record<string, number>,
  ) => void
  onEditExpense: (expenseId: string, updates: Partial<Omit<Expense, "id" | "groupId" | "date">>) => void
  onDeleteExpense: (expenseId: string) => void
}

export function GroupDetail({
  group,
  balances,
  onBack,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: GroupDetailProps) {
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setExpenseFormOpen(true)
  }

  const handleSubmitExpense = (
    description: string,
    amount: number,
    paidBy: string,
    splitType: "equal" | "exact" | "percentage",
    splits: Record<string, number>,
  ) => {
    if (editingExpense) {
      onEditExpense(editingExpense.id, {
        description,
        amount,
        paidBy,
        splitType,
        splits,
      })
      setEditingExpense(null)
    } else {
      onAddExpense(description, amount, paidBy, splitType, splits)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {group.members.length} members • {group.expenses.length} expenses
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Expenses</h2>
              <Button onClick={() => setExpenseFormOpen(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </div>
            <ExpenseList
              expenses={group.expenses}
              members={group.members}
              onEdit={handleEditExpense}
              onDelete={onDeleteExpense}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <BalanceTracker members={group.members} balances={balances} />
        </div>
      </div>

      <ExpenseForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        members={group.members}
        onSubmit={handleSubmitExpense}
        editingExpense={
          editingExpense
            ? {
              description: editingExpense.description,
              amount: editingExpense.amount,
              paidBy: editingExpense.paidBy,
              splitType: editingExpense.splitType,
              splits: editingExpense.splits,
            }
            : undefined
        }
      />
    </div>
  )
}
