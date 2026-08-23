export function formatTimeTableDate(value: string) {
    const date = new Date(`${value}T00:00:00`)
    return {
        day: date.toLocaleDateString("en-IN", { weekday: "long" }),
        date: date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    }
}
export const addHour = (time: string) => `${+time.slice(0, 2) + 1}:${time.slice(3)}`