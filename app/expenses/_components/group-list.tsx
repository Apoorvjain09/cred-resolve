"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Group } from "../_lib/expense-store"

interface GroupListProps {
  groups: Group[]
  onSelectGroup: (groupId: string) => void
  onCreateGroup: () => void
}

export function GroupList({ groups, onSelectGroup, onCreateGroup }: GroupListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Groups</h2>
        <Button onClick={onCreateGroup} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="bg-card border border-border">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No groups yet. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => onSelectGroup(group.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription>
                  {group.members.length} members • {group.expenses.length} expenses
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
