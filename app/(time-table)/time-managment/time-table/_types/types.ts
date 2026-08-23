export type TimeTableTask = {
    startTime: string
    endTime: string
    task: string
    tagId?: string
}

export type TimeTable = {
    id: string
    date: string
    tasks: TimeTableTask[]
    created_at: string
    updated_at: string
}