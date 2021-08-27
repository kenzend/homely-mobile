export class BudgetItem {
    category: string
    name: string
    amount: number
    date: string
    createdBy: string
    description: string
    desiredPercentage: number
    constructor(name: string, amount: number, date: string, createBy: string, category?: string, desiredPercentage?: number, description?: string) {
        this.category = category;
        this.name = name;
        this.amount = amount;
        this.date = date;
        this.createdBy = createBy;
        this.description = description;
        this.desiredPercentage = desiredPercentage;
    }
}