import { z } from "zod";

// ----------------------------------------------------------------------------
// Emission Factor
// ----------------------------------------------------------------------------

export const emissionFactorCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  co2PerUnit: z.number().positive("co2PerUnit must be a positive number"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const emissionFactorUpdateSchema = emissionFactorCreateSchema.partial();

// ----------------------------------------------------------------------------
// Product ESG Profile
// ----------------------------------------------------------------------------

export const productESGProfileCreateSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productCode: z.string().min(1, "Product code is required"),
  category: z.string().optional(),
  carbonFootprint: z.number().nonnegative().optional(),
  sustainableFlag: z.boolean().optional(),
  notes: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const productESGProfileUpdateSchema = productESGProfileCreateSchema.partial();

// ----------------------------------------------------------------------------
// Carbon Transaction
// ----------------------------------------------------------------------------

export const carbonTransactionCreateSchema = z.object({
  departmentId: z.string().min(1, "departmentId is required"),
  emissionFactorId: z.string().min(1, "emissionFactorId is required"),
  sourceType: z
    .enum(["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "MANUAL"])
    .optional(),
  sourceRef: z.string().optional(),
  activityAmount: z.number().positive("activityAmount must be a positive number"),
  transactionDate: z.string().datetime().optional(), // ISO string from client
});

export const carbonTransactionUpdateSchema = carbonTransactionCreateSchema.partial();

// ----------------------------------------------------------------------------
// Environmental Goal
// ----------------------------------------------------------------------------

export const environmentalGoalCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  departmentId: z.string().min(1, "departmentId is required"),
  targetCo2Kg: z.number().positive("targetCo2Kg must be a positive number"),
  currentCo2Kg: z.number().nonnegative().optional(),
  deadline: z.string().datetime("deadline must be an ISO date string"),
  status: z
    .enum(["ACTIVE", "ON_TRACK", "AT_RISK", "COMPLETED", "ARCHIVED"])
    .optional(),
});

export const environmentalGoalUpdateSchema = environmentalGoalCreateSchema.partial();