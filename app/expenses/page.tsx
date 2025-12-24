"use client"

import { useState } from "react"
import { GroupList } from "./_components/group-list"
import { GroupDetail } from "./_components/group-detail"
import { CreateGroupDialog } from "./_components/create-group-dialog"
import { useExpenseStore } from "./_hooks/use-expense-store"

export default function Home() {
    const { groups, createGroup, addExpense, editExpense, deleteExpense, getGroup, getBalances } = useExpenseStore()

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
    const [createGroupOpen, setCreateGroupOpen] = useState(false)

    const selectedGroup = selectedGroupId ? getGroup(selectedGroupId) : null
    const selectedGroupBalances = selectedGroupId ? getBalances(selectedGroupId) : []

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {!selectedGroup ? (
                    <GroupList
                        groups={groups}
                        onSelectGroup={setSelectedGroupId}
                        onCreateGroup={() => setCreateGroupOpen(true)}
                    />
                ) : (
                    <GroupDetail
                        group={selectedGroup}
                        balances={selectedGroupBalances}
                        onBack={() => setSelectedGroupId(null)}
                        onAddExpense={(description, amount, paidBy, splitType, splits) => {
                            addExpense(selectedGroupId!, description, amount, paidBy, splitType, splits)
                        }}
                        onEditExpense={(expenseId, updates) => {
                            editExpense(selectedGroupId!, expenseId, updates)
                        }}
                        onDeleteExpense={(expenseId) => {
                            deleteExpense(selectedGroupId!, expenseId)
                        }}
                    />
                )}
            </div>

            <CreateGroupDialog
                open={createGroupOpen}
                onOpenChange={setCreateGroupOpen}
                onCreateGroup={(name, members) => {
                    createGroup(name, members)
                    setCreateGroupOpen(false)
                }}
            />
        </main>
    )
}
