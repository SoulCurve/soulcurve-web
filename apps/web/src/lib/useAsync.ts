import { useEffect, useRef, useState } from "react";

type State<T> = { key: string | null; data: T | null; error: string | null };

// Re-runs `load` whenever `key` changes; results for a stale key are dropped.
export function useAsync<T>(load: () => Promise<T>, key: string) {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loadRef.current()
      .then((data) => {
        if (!cancelled) setState({ key, data, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ key, data: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const current = state.key === key;
  return { data: current ? state.data : null, error: current ? state.error : null };
}
