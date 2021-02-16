/*
  Disable execution on mount for UseEffect callback
*/
import { useEffect, useRef } from "react";

export default function useDidUpdateEffect(fn, dep) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) fn();
    else didMountRef.current = true;
  }, dep);
}
