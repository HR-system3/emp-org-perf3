export enum ConfigStatus {
    DRAFT = 'draft',
    PENDING_MANAGER_APPROVAL = 'pending_manager_approval',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export enum PolicyType {
    DEDUCTION = "Deduction",
    ALLOWANCE = "Allowance",
    BENEFIT = "Benefit",
    MISCONDUCT = "Misconduct",
    LEAVE = "Leave",
}


export enum Applicability {
    AllEmployees = "All Employees",
    FULL_TIME = "Full Time Employees",
    PART_TIME = "Part Time Employees",
    CONTRACTORS = "Contractors",
}