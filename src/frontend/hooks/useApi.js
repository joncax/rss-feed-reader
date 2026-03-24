/**
 * useApi Hook
 * File: src/frontend/hooks/useApi.js
 * Hook genérico para fetch com retry, caching e error handling
 */

import { useState, useEffect, useRef } from 'react';

export function useApi(fetchFunction, dependencies = [], options = {}) {
  const {
    autoFetch = true,
    retries = 3,
    retryDelay = 1000,
    cacheMs = null,
    onError = null,
    onSuccess = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(null);
  const cacheTimestampRef = useRef(null);

  const execute = async (skipCache = false) => {
    // Check cache
    if (cacheMs && !skipCache && cacheRef.current && cacheTimestampRef.current) {
      if (Date.now() - cacheTimestampRef.current < cacheMs) {
        setData(cacheRef.current);
        return cacheRef.current;
      }
    }

    setLoading(true);
    setError(null);

    let lastError = null;
    let lastData = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await fetchFunction();
        lastData = result;
        lastError = null;

        // Cache the result
        if (cacheMs) {
          cacheRef.current = result;
          cacheTimestampRef.current = Date.now();
        }

        setData(result);
        setError(null);
        setLoading(false);

        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        lastError = err;
        console.error(`Attempt ${attempt + 1} failed:`, err);

        if (attempt < retries - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    // All retries failed
    setError(lastError);
    setLoading(false);

    if (onError) onError(lastError);
    return null;
  };

  const refetch = async () => {
    return execute(true); // Skip cache
  };

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch,
    execute
  };
}

// =============================================
// POLLING HOOK
// =============================================

export function useApiPolling(fetchFunction, dependencies = [], options = {}) {
  const {
    interval = 5000,
    autoStart = true,
    retries = 3,
    retryDelay = 1000,
    onError = null,
    onSuccess = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(autoStart);
  const intervalRef = useRef(null);

  const poll = async () => {
    setLoading(true);
    setError(null);

    let lastError = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await fetchFunction();
        setData(result);
        setError(null);
        setLoading(false);

        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        lastError = err;
        console.error(`Poll attempt ${attempt + 1} failed:`, err);

        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    // All retries failed
    setError(lastError);
    setLoading(false);

    if (onError) onError(lastError);
    return null;
  };

  const startPolling = () => {
    if (intervalRef.current) return; // Already polling

    setIsPolling(true);
    poll(); // Fetch immediately

    intervalRef.current = setInterval(() => {
      poll();
    }, interval);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  const refetch = () => {
    return poll();
  };

  useEffect(() => {
    if (autoStart) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [interval]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    isPolling,
    refetch,
    startPolling,
    stopPolling
  };
}

// =============================================
// DEBOUNCED HOOK
// =============================================

export function useApiDebounced(fetchFunction, dependencies = [], options = {}) {
  const {
    delay = 500,
    autoFetch = false,
    retries = 3,
    onError = null,
    onSuccess = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    let lastError = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await fetchFunction();
        setData(result);
        setError(null);
        setLoading(false);

        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        lastError = err;
        console.error(`Attempt ${attempt + 1} failed:`, err);

        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // All retries failed
    setError(lastError);
    setLoading(false);

    if (onError) onError(lastError);
    return null;
  };

  const executedebounced = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      execute();
    }, delay);
  };

  const refetch = () => {
    return execute();
  };

  useEffect(() => {
    if (autoFetch) {
      executedebounced();
    }

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch,
    execute: executedebounced
  };
}