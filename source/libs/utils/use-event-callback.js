/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useCallback } from "react";

const useEventCallback = (fn, dependencies) => {
  const ref = useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });

  useEffect(
    () => {
      ref.current = fn;
    },
    [fn, ...dependencies]
  );

  return useCallback(
    (...args) => {
      const lfn = ref.current;
      return lfn(...args);
    },
    [ref]
  );
};

export default useEventCallback;
