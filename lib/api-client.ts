import type {
  ApiResponse,
  CarbonTransaction,
  CarbonTransactionInput,
  DepartmentSummary,
  EmissionFactor,
  EmissionFactorInput,
  EnvironmentalDashboard,
  EnvironmentalGoal,
  EnvironmentalGoalInput,
  ProductESGProfile,
  ProductESGProfileInput,
} from "@/types/environmental";

const BASE = "/api/environmental";

/**
 * Thrown on any non-2xx response. `details` carries Zod's field errors when
 * the failure was validation, so forms can surface them inline.
 */
export class ApiRequestError extends Error {
  details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiRequestError(json.error, json.details);
  }

  return json.data;
}

function qs(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(
    (e): e is [string, string] => e[1] !== undefined && e[1] !== ""
  );
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

// ---------------------------------------------------------------------------
// Emission Factors
// ---------------------------------------------------------------------------

export const emissionFactors = {
  list: (filters: { status?: string; category?: string; search?: string } = {}) =>
    request<EmissionFactor[]>(`/emission-factors${qs(filters)}`),

  get: (id: string) => request<EmissionFactor>(`/emission-factors/${id}`),

  create: (data: EmissionFactorInput) =>
    request<EmissionFactor>("/emission-factors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<EmissionFactorInput>) =>
    request<EmissionFactor>(`/emission-factors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/emission-factors/${id}`, {
      method: "DELETE",
    }),
};

// ---------------------------------------------------------------------------
// Product ESG Profiles
// ---------------------------------------------------------------------------

export const productProfiles = {
  list: (filters: { status?: string; category?: string; search?: string } = {}) =>
    request<ProductESGProfile[]>(`/product-esg-profiles${qs(filters)}`),

  get: (id: string) => request<ProductESGProfile>(`/product-esg-profiles/${id}`),

  create: (data: ProductESGProfileInput) =>
    request<ProductESGProfile>("/product-esg-profiles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<ProductESGProfileInput>) =>
    request<ProductESGProfile>(`/product-esg-profiles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/product-esg-profiles/${id}`, {
      method: "DELETE",
    }),
};

// ---------------------------------------------------------------------------
// Carbon Transactions
// ---------------------------------------------------------------------------

export const carbonTransactions = {
  list: (
    filters: {
      departmentId?: string;
      sourceType?: string;
      from?: string;
      to?: string;
    } = {}
  ) => request<CarbonTransaction[]>(`/carbon-transactions${qs(filters)}`),

  get: (id: string) => request<CarbonTransaction>(`/carbon-transactions/${id}`),

  create: (data: CarbonTransactionInput) =>
    request<CarbonTransaction>("/carbon-transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CarbonTransactionInput>) =>
    request<CarbonTransaction>(`/carbon-transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/carbon-transactions/${id}`, {
      method: "DELETE",
    }),
};

// ---------------------------------------------------------------------------
// Environmental Goals
// ---------------------------------------------------------------------------

export const goals = {
  list: (filters: { departmentId?: string; status?: string } = {}) =>
    request<EnvironmentalGoal[]>(`/goals${qs(filters)}`),

  get: (id: string) => request<EnvironmentalGoal>(`/goals/${id}`),

  create: (data: EnvironmentalGoalInput) =>
    request<EnvironmentalGoal>("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<EnvironmentalGoalInput>) =>
    request<EnvironmentalGoal>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/goals/${id}`, {
      method: "DELETE",
    }),
};

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export const environmental = {
  dashboard: () => request<EnvironmentalDashboard>("/dashboard"),
  departmentSummaries: () => request<DepartmentSummary[]>("/departments/summary"),
};