"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"
import { Expense, User } from "../_lib/expense-store"

interface ExpenseListProps {
  expenses: Expense[]
  members: User[]
  onEdit: (expense: Expense) => void
  onDelete: (expenseId: string) => void
}

export function ExpenseList({ expenses, members, onEdit, onDelete }: ExpenseListProps) {
  const memberMap = new Map(members.map((m) => [m.id, m]))

  if (expenses.length === 0) {
    return (
      <Card className="bg-card border border-border">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>No expenses yet. Add one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {[...expenses].reverse().map((expense) => {
        const paidByMember = memberMap.get(expense.paidBy)
        const date = new Date(expense.date).toLocaleDateString()

        return (
          <Card key={expense.id} className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{expense.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paid by <span className="font-medium">{paidByMember?.name}</span> on {date}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {expense.splitType === "equal" && "Split equally"}
                    {expense.splitType === "exact" && "Split by exact amounts"}
                    {expense.splitType === "percentage" && "Split by percentages"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{expense.amount.toFixed(2)}</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(expense)} className="px-2">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(expense.id)}
                      className="px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
