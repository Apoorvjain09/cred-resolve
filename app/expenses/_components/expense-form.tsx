"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from "../_lib/expense-store"

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: User[]
  onSubmit: (
    description: string,
    amount: number,
    paidBy: string,
    splitType: "equal" | "exact" | "percentage",
    splits: Record<string, number>,
  ) => void
  editingExpense?: {
    description: string
    amount: number
    paidBy: string
    splitType: "equal" | "exact" | "percentage"
    splits: Record<string, number>
  }
}

export function ExpenseForm({ open, onOpenChange, members, onSubmit, editingExpense }: ExpenseFormProps) {
  const [description, setDescription] = useState(editingExpense?.description || "")
  const [amount, setAmount] = useState(editingExpense?.amount.toString() || "")
  const [paidBy, setPaidBy] = useState(editingExpense?.paidBy || members[0]?.id || "")
  const [splitType, setSplitType] = useState<"equal" | "exact" | "percentage">(editingExpense?.splitType || "equal")
  const [splits, setSplits] = useState<Record<string, number>>(
    editingExpense?.splits || members.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {}),
  )

  const handleSubmit = () => {
    if (!description.trim() || !amount || !paidBy) {
      alert("Please fill in all required fields")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    // Validate splits
    if (splitType === "equal") {
      const selectedCount = Object.values(splits).filter((v) => v).length
      if (selectedCount === 0) {
        alert("Please select at least one person to split with")
        return
      }
    } else if (splitType === "exact") {
      const total = Object.values(splits).reduce((a, b) => a + b, 0)
      if (Math.abs(total - numAmount) > 0.01) {
        alert(`Split amounts must equal the total (${numAmount})`)
        return
      }
    } else if (splitType === "percentage") {
      const total = Object.values(splits).reduce((a, b) => a + b, 0)
      if (Math.abs(total - 100) > 0.01) {
        alert("Percentages must equal 100%")
        return
      }
    }

    onSubmit(description, numAmount, paidBy, splitType, splits)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setPaidBy(members[0]?.id || "")
    setSplitType("equal")
    setSplits(members.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {}))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>Enter expense details and select how to split it</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Dinner, Gas, Hotel..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paid-by">Paid By</Label>
            <select
              id="paid-by"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Split Type</Label>
            <Tabs
              value={splitType}
              onValueChange={(value) => {
                setSplitType(value as "equal" | "exact" | "percentage")
                // Reset splits based on type
                if (value === "equal") {
                  setSplits(members.reduce((acc, m) => ({ ...acc, [m.id]: 1 }), {}))
                } else if (value === "percentage") {
                  setSplits(members.reduce((acc, m) => ({ ...acc, [m.id]: 100 / members.length }), {}))
                } else {
                  setSplits(members.reduce((acc, m) => ({ ...acc, [m.id]: 0 }), {}))
                }
              }}
              className="mt-2"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal">Equal</TabsTrigger>
                <TabsTrigger value="exact">Exact</TabsTrigger>
                <TabsTrigger value="percentage">Percentage</TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="space-y-2 mt-3">
                <p className="text-sm text-muted-foreground">Split equally among selected members</p>
                {members.map((member) => (
                  <label key={member.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={splits[member.id] === 1}
                      onChange={(e) => {
                        setSplits({
                          ...splits,
                          [member.id]: e.target.checked ? 1 : 0,
                        })
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: member.color }} />
                      {member.name}
                    </span>
                  </label>
                ))}
              </TabsContent>

              <TabsContent value="exact" className="space-y-2 mt-3">
                <p className="text-sm text-muted-foreground">Enter exact amount each person owes</p>
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="w-32 text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: member.color }} />
                      {member.name}
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={splits[member.id] || 0}
                      onChange={(e) => {
                        setSplits({
                          ...splits,
                          [member.id]: Number.parseFloat(e.target.value) || 0,
                        })
                      }}
                      className="flex-1"
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="percentage" className="space-y-2 mt-3">
                <p className="text-sm text-muted-foreground">Enter percentage each person owes</p>
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="w-32 text-sm flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: member.color }} />
                      {member.name}
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.01"
                      value={splits[member.id] || 0}
                      onChange={(e) => {
                        setSplits({
                          ...splits,
                          [member.id]: Number.parseFloat(e.target.value) || 0,
                        })
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingExpense ? "Save Changes" : "Add Expense"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
