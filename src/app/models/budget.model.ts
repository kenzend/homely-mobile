import { BudgetItem } from "./budget_item.model"

export class Budget {
    name: string
    startDate: string
    endDate: string
    budgetItems: BudgetItem[]
    owner: string
    members: string[]

    constructor(name: string, startDate: string, endDate: string, budgetItems: BudgetItem[], owner: string, members: string[]) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.budgetItems = budgetItems;
        this.owner = owner;
        this.members = members;
    }
}