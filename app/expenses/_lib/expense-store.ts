// Centralized fake data store for expense tracking
export type SplitType = "equal" | "exact" | "percentage"

export interface User {
  id: string
  name: string
  color: string
}

export interface Expense {
  id: string
  groupId: string
  description: string
  amount: number
  paidBy: string
  splitType: SplitType
  splits: Record<string, number> // userId -> amount/percentage
  date: string
}

export interface Group {
  id: string
  name: string
  members: User[]
  expenses: Expense[]
  createdAt: string
}

export interface Balance {
  from: string
  to: string
  amount: number
}

// Helper functions for calculations
export function calculateBalances(expenses: Expense[], groupMembers: User[]): Balance[] {
  const balances: Record<string, number> = {}
  const memberIds = groupMembers.map((m) => m.id)

  // Initialize all balances
  memberIds.forEach((id) => {
    balances[id] = 0
  })

  // Process each expense
  expenses.forEach((expense) => {
    const paidBy = expense.paidBy
    let splitAmounts: Record<string, number> = {} // Changed from const to let

    // Calculate split amounts based on split type
    if (expense.splitType === "equal") {
      const splitCount = Object.keys(expense.splits).length
      const amountPerPerson = expense.amount / splitCount
      Object.keys(expense.splits).forEach((userId) => {
        splitAmounts[userId] = amountPerPerson
      })
    } else if (expense.splitType === "exact") {
      splitAmounts = { ...expense.splits }
    } else if (expense.splitType === "percentage") {
      Object.entries(expense.splits).forEach(([userId, percentage]) => {
        splitAmounts[userId] = (expense.amount * percentage) / 100
      })
    }

    // Calculate who owes whom
    Object.entries(splitAmounts).forEach(([userId, amount]) => {
      if (userId !== paidBy) {
        // userId owes paidBy
        const key = `${userId}|${paidBy}`
        balances[key] = (balances[key] || 0) + amount
      }
    })
  })

  // Convert to array format and simplify
  const balanceArray: Balance[] = []
  Object.entries(balances).forEach(([key, amount]) => {
    if (amount > 0.01) {
      const [from, to] = key.split("|")
      balanceArray.push({ from, to, amount: Math.round(amount * 100) / 100 })
    }
  })

  return simplifyBalances(balanceArray)
}

// Simplify debts to minimize transactions
export function simplifyBalances(balances: Balance[]): Balance[] {
  const netBalances: Record<string, number> = {}

  // Calculate net balance for each person
  balances.forEach((balance) => {
    netBalances[balance.from] = (netBalances[balance.from] || 0) - balance.amount
    netBalances[balance.to] = (netBalances[balance.to] || 0) + balance.amount
  })

  // Find debtors and creditors
  const debtors: Array<[string, number]> = []
  const creditors: Array<[string, number]> = []

  Object.entries(netBalances).forEach(([userId, balance]) => {
    if (balance < -0.01) {
      debtors.push([userId, Math.abs(balance)])
    } else if (balance > 0.01) {
      creditors.push([userId, balance])
    }
  })

  const simplified: Balance[] = []
  let debtorIdx = 0
  let creditorIdx = 0

  while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
    const [debtorId, debtAmount] = debtors[debtorIdx]
    const [creditorId, creditAmount] = creditors[creditorIdx]

    const amount = Math.min(debtAmount, creditAmount)
    simplified.push({
      from: debtorId,
      to: creditorId,
      amount: Math.round(amount * 100) / 100,
    })

    debtors[debtorIdx][1] -= amount
    creditors[creditorIdx][1] -= amount

    if (debtors[debtorIdx][1] < 0.01) debtorIdx++
    if (creditors[creditorIdx][1] < 0.01) creditorIdx++
  }

  return simplified
}

// Generate color for users
export const userColors = [
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#14b8a6",
  "#6366f1",
  "#d946ef",
]

export function getColorForUser(index: number): string {
  return userColors[index % userColors.length]
}
