export const TIME_TAGS = [
    // Focus / Building
    { id: "deep-work", label: "Deep work", className: "bg-blue-100 text-blue-800 border-blue-200" },
    { id: "coding", label: "Coding", className: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    { id: "ai", label: "AI / Agents", className: "bg-sky-100 text-sky-800 border-sky-200" },
    { id: "product", label: "Product", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { id: "debugging", label: "Debugging", className: "bg-blue-100 text-blue-800 border-blue-200" },
    { id: "startup", label: "Startup", className: "bg-violet-100 text-violet-800 border-violet-200" },

    // Learning / Thinking
    { id: "study", label: "Study", className: "bg-violet-100 text-violet-800 border-violet-200" },
    { id: "revision", label: "Revision", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { id: "reading", label: "Reading", className: "bg-sky-100 text-sky-800 border-sky-200" },
    { id: "research", label: "Research", className: "bg-purple-100 text-purple-800 border-purple-200" },
    { id: "thinking", label: "Thinking", className: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
    { id: "planning", label: "Planning", className: "bg-slate-100 text-slate-800 border-slate-200" },

    // Markets / Business
    { id: "markets", label: "Markets", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { id: "investment-research", label: "Investment research", className: "bg-green-100 text-green-800 border-green-200" },
    { id: "business", label: "Business", className: "bg-teal-100 text-teal-800 border-teal-200" },
    { id: "sales", label: "Sales", className: "bg-orange-100 text-orange-800 border-orange-200" },
    { id: "meetings", label: "Meetings", className: "bg-stone-100 text-stone-800 border-stone-200" },
    { id: "admin", label: "Admin", className: "bg-zinc-100 text-zinc-800 border-zinc-200" },

    // Career / University
    { id: "applications", label: "Applications", className: "bg-purple-100 text-purple-800 border-purple-200" },
    { id: "university", label: "University", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { id: "writing", label: "Writing", className: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },

    // Physical
    { id: "mma", label: "MMA", className: "bg-red-100 text-red-800 border-red-200" },
    { id: "gym", label: "Gym", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { id: "walk", label: "Walk", className: "bg-green-100 text-green-800 border-green-200" },

    // Life
    { id: "food", label: "Food", className: "bg-amber-100 text-amber-800 border-amber-200" },
    { id: "chores", label: "Chores", className: "bg-lime-100 text-lime-800 border-lime-200" },
    { id: "commute", label: "Commute", className: "bg-orange-100 text-orange-800 border-orange-200" },
    { id: "social", label: "Social", className: "bg-pink-100 text-pink-800 border-pink-200" },
    { id: "break", label: "Break", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { id: "entertainment", label: "Entertainment", className: "bg-rose-100 text-rose-800 border-rose-200" },
    { id: "sleep", label: "Sleep", className: "bg-purple-100 text-purple-800 border-purple-200" },

    // Important one :)
    { id: "wasted", label: "Wasted", className: "bg-red-100 text-red-800 border-red-200" },
    { id: "other", label: "Other", className: "bg-neutral-100 text-neutral-800 border-neutral-200" },
] as const

export function getTimeTag(tagId?: string) {
    return TIME_TAGS.find((tag) => tag.id === tagId)
}