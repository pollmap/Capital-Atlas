"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================================
// Macro Market Data Hook
// ============================================================

interface MacroData {
  value: string | null;
  change: string | null;
  direction: string;
  date: string | null;
  source: string;
}

interface UseMacroDataResult {
  data: MacroData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMacroData(nodeId: string): UseMacroDataResult {
  const [data, setData] = useState<MacroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/macro/${nodeId}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================
// Company Price Hook
// ============================================================

interface CompanyPrice {
  price: number | null;
  previousClose?: number;
  change: number | null;
  changePercent: number | null;
  currency?: string;
  marketState?: string;
  source: string;
}

interface UseCompanyPriceResult {
  data: CompanyPrice | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCompanyPrice(companyId: string): UseCompanyPriceResult {
  const [data, setData] = useState<CompanyPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/${companyId}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================
// DART Financial Data Hook
// ============================================================

interface DartFinancials {
  year: string;
  revenue: number | null;
  revenuePrev: number | null;
  operatingProfit: number | null;
  operatingProfitPrev: number | null;
  netIncome: number | null;
  netIncomePrev: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
  source: string;
}

interface UseDartResult {
  data: DartFinancials | null;
  loading: boolean;
  error: string | null;
}

export function useDartFinancials(companyId: string): UseDartResult {
  const [data, setData] = useState<DartFinancials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dart/${companyId}`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [companyId]);

  return { data, loading, error };
}

// ============================================================
// Batch Macro Data Hook (for dashboards)
// ============================================================

interface BatchMacroData {
  [nodeId: string]: MacroData;
}

export function useBatchMacroData(nodeIds: string[]): {
  data: BatchMacroData;
  loading: boolean;
} {
  const [data, setData] = useState<BatchMacroData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      const results: BatchMacroData = {};

      // Fetch in parallel with concurrency limit of 5
      const chunks: string[][] = [];
      for (let i = 0; i < nodeIds.length; i += 5) {
        chunks.push(nodeIds.slice(i, i + 5));
      }

      for (const chunk of chunks) {
        const promises = chunk.map(async (id) => {
          try {
            const res = await fetch(`/api/macro/${id}`);
            if (res.ok) {
              const json = await res.json();
              results[id] = json;
            }
          } catch {
            // Silently fail for individual items
          }
        });
        await Promise.all(promises);
      }

      if (!cancelled) {
        setData(results);
        setLoading(false);
      }
    }

    if (nodeIds.length > 0) {
      fetchAll();
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [nodeIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading };
}
