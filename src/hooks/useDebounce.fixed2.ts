import { useState, useEffect, useCallback, useRef } from "react";

interface UseDebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: UseDebounceOptions = {},
): T {
  const { leading = false, trailing = true, maxWait } = options;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const maxWaitRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const argsRef = useRef<Parameters<T> | undefined>(undefined);
  const leadingCalledRef = useRef(false);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;

      if (leading && !leadingCalledRef.current) {
        callback(...args);
        leadingCalledRef.current = true;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          if (!leading || leadingCalledRef.current) {
            callback(...args);
          }
          leadingCalledRef.current = false;
          if (maxWaitRef.current) {
            clearTimeout(maxWaitRef.current);
            maxWaitRef.current = undefined;
          }
        }, delay);
      }

      if (maxWait && !maxWaitRef.current) {
        maxWaitRef.current = setTimeout(() => {
          if (argsRef.current) {
            callback(...argsRef.current);
          }
          leadingCalledRef.current = false;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
          }
          if (maxWaitRef.current) {
            clearTimeout(maxWaitRef.current);
            maxWaitRef.current = undefined;
          }
        }, maxWait);
      }
    },
    [callback, delay, leading, trailing, maxWait],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxWaitRef.current) {
        clearTimeout(maxWaitRef.current);
      }
    };
  }, []);

  return debouncedFunction as T;
}

export function useDebounceWithCompare<T>(
  value: T,
  delay: number,
  compareFn: (prev: T, next: T) => boolean,
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    if (!compareFn(previousValueRef.current, value)) {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
        previousValueRef.current = value;
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, delay, compareFn]);

  return debouncedValue;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
): T {
  const inThrottleRef = useRef(false);
  const lastArgsRef = useRef<Parameters<T> | undefined>(undefined);

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        callback(...args);
        inThrottleRef.current = true;

        setTimeout(() => {
          inThrottleRef.current = false;
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
            lastArgsRef.current = undefined;
          }
        }, limit);
      } else {
        lastArgsRef.current = args;
      }
    },
    [callback, limit],
  );

  return throttledFunction as T;
}

export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300,
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFn(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, searchFn]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    debouncedQuery,
  };
}

export function useDebouncedSubmit<T extends (...args: any[]) => any>(
  submitFn: T,
  delay: number = 500,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSubmit = useDebouncedCallback(
    async (...args: Parameters<T>) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await submitFn(...args);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submission failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    delay,
  );

  return {
    submit: debouncedSubmit,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}

export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay: number = 1000,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSave = useDebouncedCallback(
    async (dataToSave: T) => {
      setIsSaving(true);
      setError(null);

      try {
        await saveFn(dataToSave);
        setLastSaved(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      } finally {
        setIsSaving(false);
      }
    },
    delay,
    { leading: false, trailing: true },
  );

  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}

export function useDebouncedResize(delay: number = 200) {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const handleResize = useDebouncedCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, delay);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return dimensions;
}
