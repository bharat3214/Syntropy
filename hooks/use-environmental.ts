"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiRequestError,
  carbonTransactions,
  emissionFactors,
  environmental,
  goals,
  productProfiles,
} from "@/lib/api-client";
import type {
  CarbonTransaction,
  DepartmentSummary,
  EmissionFactor,
  EnvironmentalDashboard,
  EnvironmentalGoal,
  ProductESGProfile,
} from "@/types/environmental";

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic read hook.
 *
 * `key` is a serialized string of the filter values — a single stable
 * dependency. Spreading a variable-length deps array into useEffect is
 * unreliable; a string key is not.
 *
 * The fetcher is held in a ref so a new closure on every render doesn't
 * retrigger the effect — only a change in `key` (or refetch) does.
 */
function useQuery<T>(fetcher: () => Promise<T>, key: string): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Something went wrong. Try again."
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, tick]);

  return { data, isLoading, error, refetch };
}

/**
 * Write hook. Tracks in-flight state so buttons can disable, and surfaces
 * Zod field errors from the API for inline form validation.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const mutate = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setIsPending(true);
    setError(null);
    setFieldErrors({});

    try {
      return await fnRef.current(...args);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        const details = err.details as
          | { fieldErrors?: Record<string, string[]> }
          | undefined;
        if (details?.fieldErrors) setFieldErrors(details.fieldErrors);
      } else if (err instanceof Error) {
        setError(err.message);
        const details = (err as Error & { details?: unknown }).details as
          | { fieldErrors?: Record<string, string[]> }
          | undefined;
        if (details?.fieldErrors) setFieldErrors(details.fieldErrors);
      } else {
        setError("Something went wrong. Try again.");
      }
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  return { mutate, isPending, error, fieldErrors, reset };
}

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

export function useEmissionFactors(
  filters: { status?: string; category?: string; search?: string } = {}
) {
  const { status, category, search } = filters;
  return useQuery<EmissionFactor[]>(
    () => emissionFactors.list({ status, category, search }),
    `emission-factors|${status ?? ""}|${category ?? ""}|${search ?? ""}`
  );
}

export function useProductProfiles(
  filters: { status?: string; category?: string; search?: string } = {}
) {
  const { status, category, search } = filters;
  return useQuery<ProductESGProfile[]>(
    () => productProfiles.list({ status, category, search }),
    `product-profiles|${status ?? ""}|${category ?? ""}|${search ?? ""}`
  );
}

export function useCarbonTransactions(
  filters: {
    departmentId?: string;
    sourceType?: string;
    from?: string;
    to?: string;
  } = {}
) {
  const { departmentId, sourceType, from, to } = filters;
  return useQuery<CarbonTransaction[]>(
    () => carbonTransactions.list({ departmentId, sourceType, from, to }),
    `carbon-transactions|${departmentId ?? ""}|${sourceType ?? ""}|${from ?? ""}|${to ?? ""}`
  );
}

export function useGoals(
  filters: { departmentId?: string; status?: string } = {}
) {
  const { departmentId, status } = filters;
  return useQuery<EnvironmentalGoal[]>(
    () => goals.list({ departmentId, status }),
    `goals|${departmentId ?? ""}|${status ?? ""}`
  );
}

export function useEnvironmentalDashboard() {
  return useQuery<EnvironmentalDashboard>(
    () => environmental.dashboard(),
    "dashboard"
  );
}

export function useDepartmentSummaries() {
  return useQuery<DepartmentSummary[]>(
    () => environmental.departmentSummaries(),
    "department-summaries"
  );
}