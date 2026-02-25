import { useCallback, useEffect, useRef, useState } from "react";

interface UseDebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * Debounced value hook
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook with advanced options
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @param options - Debounce options
 * @returns Debounced function
 */
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

      // Handle leading call
      if (leading && !leadingCalledRef.current) {
        callback(...args);
        leadingCalledRef.current = true;
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set trailing timeout
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

      // Set max wait timeout
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

  // Cleanup
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

/**
 * Debounces a value with custom comparison
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @param compareFn - Custom comparison function
 * @returns Debounced value
 */
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

      return () => clearTimeout(timer);
    }
  }, [value, delay, compareFn]);

  return debouncedValue;
}

/**
 * Creates a debounced version of any async function
 * @param asyncFn - Async function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced async function
 */
export function useDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  delay: number,
): [T, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedFn = useCallback(
    async (...args: Parameters<T>) => {
      setIsLoading(true);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await asyncFn(...args);
            if (!signal.aborted) {
              resolve(result);
              setIsLoading(false);
            }
          } catch (error) {
            if (!signal.aborted) {
              reject(error);
              setIsLoading(false);
            }
          }
        }, delay);
      });
    },
    [asyncFn, delay],
  );

  return [debouncedFn as T, isLoading];
}

/**
 * Throttles a callback function (leading + trailing)
 * @param callback - The function to throttle
 * @param limit - Limit in milliseconds
 * @returns Throttled function
 */
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

/**
 * Throttles a value
 * @param value - The value to throttle
 * @param limit - Limit in milliseconds
 * @returns Throttled value
 */
export function useThrottleValue<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now - lastUpdateRef.current >= limit) {
      lastUpdateRef.current = now;
      setThrottledValue(value);
    } else {
      const timeout = setTimeout(
        () => {
          lastUpdateRef.current = Date.now();
          setThrottledValue(value);
        },
        limit - (now - lastUpdateRef.current),
      );

      return () => clearTimeout(timeout);
    }
  }, [value, limit]);

  return throttledValue;
}

/**
 * Combines debounce and throttle for optimal performance
 * @param callback - The function to debounce and throttle
 * @param delay - Debounce delay in milliseconds
 * @param maxWait - Throttle max wait in milliseconds
 * @returns Debounced and throttled function
 */
export function useDebouncedThrottled<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  maxWait: number,
): T {
  return useDebouncedCallback(callback, delay, {
    leading: true,
    trailing: true,
    maxWait,
  });
}
