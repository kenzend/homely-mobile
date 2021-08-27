export class Task{
    category: string
    title: string
    start: string
    end: string
    members: string[]
    backgroundColor: string
    isCompleted: boolean
    notes: string
    constructor(title: string, start: string, end: string, members: string[], backgroundColor: string, isCompleted: boolean, notes: string, category?: string) {
        this.category = category;
        this.title = title;
        this.start = start;
        this.end = end;
        this.members = members;
        this.backgroundColor = backgroundColor;
        this.isCompleted = isCompleted;
        this.notes = notes;
    }
}