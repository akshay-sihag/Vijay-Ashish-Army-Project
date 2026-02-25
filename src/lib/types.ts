export const STATUS_OPTIONS = ["Working", "Not Working", "NA"] as const;
export const SOLUTION_OPTIONS = ["Available", "Not Available", "NA"] as const;
export const SPARES_OPTIONS = ["Required", "Not Required", "NA"] as const;
export const PRIORITY_OPTIONS = ["Low", "Medium", "High"] as const;
export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export type Status = (typeof STATUS_OPTIONS)[number];
export type Solution = (typeof SOLUTION_OPTIONS)[number];
export type Spares = (typeof SPARES_OPTIONS)[number];
export type Priority = (typeof PRIORITY_OPTIONS)[number];
export type Gender = (typeof GENDER_OPTIONS)[number];
