"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Balance, User } from "../_lib/expense-store"

interface BalanceTrackerProps {
  members: User[]
  balances: Balance[]
  currentUserId?: string
}

export function BalanceTracker({ members, balances, currentUserId }: BalanceTrackerProps) {
  const memberMap = new Map(members.map((m) => [m.id, m]))

  // Calculate net balance for each person
  const netBalances = new Map<string, number>()
  members.forEach((m) => netBalances.set(m.id, 0))

  balances.forEach((balance) => {
    netBalances.set(balance.from, (netBalances.get(balance.from) || 0) - balance.amount)
    netBalances.set(balance.to, (netBalances.get(balance.to) || 0) + balance.amount)
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Balance Summary</h3>

      <div className="grid gap-3">
        {members.map((member) => {
          const balance = netBalances.get(member.id) || 0
          const isPositive = balance > 0.01
          const isNegative = balance < -0.01

          return (
            <Card key={member.id} className="bg-card border border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: member.color }} />
                    <span className="font-medium text-foreground">{member.name}</span>
                  </div>
                  <div className="text-right">
                    {isPositive && <p className="text-green-600 font-semibold">owed {Math.abs(balance).toFixed(2)}</p>}
                    {isNegative && <p className="text-red-600 font-semibold">owes {Math.abs(balance).toFixed(2)}</p>}
                    {!isPositive && !isNegative && <p className="text-muted-foreground">settled up</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {balances.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-lg font-semibold text-foreground">Settlement Plan</h3>
          {balances.map((balance, index) => {
            const fromMember = memberMap.get(balance.from)
            const toMember = memberMap.get(balance.to)

            return (
              <Card key={index} className="bg-accent/30 border border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{fromMember?.name}</span>
                      <span className="text-muted-foreground">pays</span>
                      <span className="font-medium text-foreground">{toMember?.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{balance.amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
